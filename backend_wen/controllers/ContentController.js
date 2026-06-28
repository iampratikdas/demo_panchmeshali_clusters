const fs = require("fs");
const path = require("path");
const moment = require("moment");
const multer = require("multer");
require('dotenv').config();

// Utility imports
const gen = require("../utils/GenKey.js");
const Config = require("../utils/Config.js");
const { encrypt, verify } = require("../utils/hashing");
const {
  GenUserToken,
  GetUserAuthorization,
} = require("../utils/Authorization.js");
const nodemailer = require('nodemailer');
const gobalPagination = require('../resuable_functions/mongodb/GlobalModelFunctions')
const { json } = require("body-parser");
const { proofreadWithAI, stripHtml } = require("../utils/ai/proofreadService");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

class ContentController {
  constructor(modelfunctions) {
    console.log("Content controller is active now======>", modelfunctions);
    this.userFunc = modelfunctions.usersFunctions;
    this.contentFunc = modelfunctions.contentFunctions;
    this.voteFunc = modelfunctions.voteFunctions;
    this.eventFunc = modelfunctions.eventFunctions;
    this.noticeFunc = modelfunctions.noticeFunctions;
    this.workspaceFileFunc = modelfunctions.workspaceFileFunctions;
    this.folderFunc = modelfunctions.folderFunctions;
    this.publisherFunc = modelfunctions.publisherFunctions;
    this.proofReadFunc = modelfunctions.proofReadFunctions;
    // this.paginationFunc = modelfunctions.pagination;
  }

  async _getApprovedContentsMarkedPr(eid, pid) {
    const doneContIds = await this.proofReadFunc.findDoneContIds(eid, pid);
    if (!doneContIds.length) return [];

    return await this.contentFunc.findOneEvenTContentAll({
      eid,
      status: 'Approved',
      cont_id: { $in: doneContIds },
    });
  }

  _countWords(text = "") {
    const plain = stripHtml(text);
    return plain.split(/\s+/).filter(Boolean).length;
  }

  async _canProofreadContent(token_data, contentItem) {
    const role = (token_data.role || "").toLowerCase();
    if (["admin", "manager"].includes(role)) return true;
    if (role !== "publisher" || !contentItem?.eid) return false;

    const event = await this.eventFunc.findOneEvent({ eid: contentItem.eid });
    if (!event?.pid) return false;

    const publisher = await this.publisherFunc.findOnePublisher({
      pid: event.pid,
      uids: { $in: [token_data.uid] },
    });
    return !!publisher;
  }

  sanitizeFileName(name) {
    return (name || 'content')
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
      .replace(/\s+/g, '_')
      .substring(0, 80);
  }

  _contentListProject() {
    return {
      _id: 1,
      cont_id: 1,
      eid: 1,
      name: 1,
      type: 1,
      h_title: 1,
      episodeNumber: 1,
      wordCount: 1,
      category: 1,
      content: 1,
      totalMarks: 1,
      uid: 1,
      status: 1,
      author_name: 1,
      createdAt: 1,
      updatedAt: 1,
      marks: 1,
    };
  }

  _contentListPipeline(matchFilter, sortBy) {
    return [
      { $match: matchFilter },
      {
        $addFields: {
          totalMarks: {
            $sum: {
              $map: {
                input: { $ifNull: ["$marks", []] },
                as: "m",
                in: {
                  $sum: {
                    $map: {
                      input: { $objectToArray: "$$m" },
                      as: "kv",
                      in: "$$kv.v",
                    },
                  },
                },
              },
            },
          },
        },
      },
      { $project: this._contentListProject() },
      { $sort: sortBy || { createdAt: -1 } },
    ];
  }

  async _getEpisodeWiseMap(eids) {
    const map = {};
    const unique = [...new Set((eids || []).filter(Boolean))];
    await Promise.all(
      unique.map(async (eid) => {
        const event = await this.eventFunc.findOneEvent({ eid });
        map[eid] = !!event?.episode_wise;
      })
    );
    return map;
  }

  _groupContentsByEpisodeWise(items, episodeWiseMap) {
    const nonEpisode = [];
    const groups = new Map();

    for (const item of items) {
      if (!item.eid || !episodeWiseMap[item.eid]) {
        nonEpisode.push({ ...item, episode_wise: false });
        continue;
      }

      const seriesKey = item.h_title || item.cont_id;
      const groupKey = `${item.eid}:${seriesKey}`;
      const existing = groups.get(groupKey);

      if (!existing) {
        groups.set(groupKey, { representative: item, episodes: [item] });
        continue;
      }

      existing.episodes.push(item);
      const existingEp = parseInt(existing.representative.episodeNumber || "9999", 10);
      const currentEp = parseInt(item.episodeNumber || "9999", 10);
      if (currentEp < existingEp) {
        existing.representative = item;
      }
    }

    const grouped = [
      ...nonEpisode,
      ...Array.from(groups.values()).map(({ representative, episodes }) => {
        const seriesKey = representative.h_title || representative.cont_id;
        const head =
          episodes.find((ep) => ep.cont_id === seriesKey) ||
          episodes.sort(
            (a, b) =>
              parseInt(a.episodeNumber || "0", 10) -
              parseInt(b.episodeNumber || "0", 10)
          )[0] ||
          representative;

        return {
          ...head,
          cont_id: head.cont_id,
          episode_wise: true,
          episode_count: episodes.length,
          series_key: seriesKey,
          episodes: episodes
            .sort(
              (a, b) =>
                parseInt(a.episodeNumber || "0", 10) -
                parseInt(b.episodeNumber || "0", 10)
            )
            .map((ep) => ({
              cont_id: ep.cont_id,
              name: ep.name,
              episodeNumber: ep.episodeNumber,
              content: ep.content,
              createdAt: ep.createdAt,
              status: ep.status,
              wordCount: ep.wordCount,
            })),
        };
      }),
    ];

    return grouped.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  }

  _enrichSingleContent(item, allItems, episodeWiseMap) {
    if (!item?.eid || !episodeWiseMap[item.eid]) {
      return { ...item, episode_wise: false };
    }

    const seriesKey = item.h_title || item.cont_id;
    const episodes = allItems
      .filter(
        (i) =>
          i.eid === item.eid && (i.h_title || i.cont_id) === seriesKey
      )
      .sort(
        (a, b) =>
          parseInt(a.episodeNumber || "0", 10) -
          parseInt(b.episodeNumber || "0", 10)
      );

    const head =
      episodes.find((ep) => ep.cont_id === seriesKey) || episodes[0] || item;

    return {
      ...head,
      episode_wise: true,
      episode_count: episodes.length,
      series_key: seriesKey,
      episodes: episodes.map((ep) => ({
        cont_id: ep.cont_id,
        name: ep.name,
        episodeNumber: ep.episodeNumber,
        content: ep.content,
        createdAt: ep.createdAt,
        status: ep.status,
        wordCount: ep.wordCount,
      })),
    };
  }

  async ensureWorkspaceFolder(uid, folderName, parentId = 'root') {
    const trimmedName = (folderName || '').trim();
    if (!trimmedName || trimmedName === 'root') {
      return 'root';
    }

    const siblings = await this.folderFunc.findChildren(uid, parentId);
    const existing = siblings.find((f) => f.name === trimmedName);
    if (existing) {
      return existing.folder_id;
    }

    const newFolder = {
      folder_id: gen(12),
      name: trimmedName,
      uid,
      parentId,
      color: '#374151',
      createdAt: String(moment().unix()),
      updatedAt: String(moment().unix()),
    };
    await this.folderFunc.insertFolder(newFolder);
    return newFolder.folder_id;
  }

  async resolveWorkspaceFolderId(uid, url, event) {
    if (url && url !== 'root') {
      const existingById = await this.folderFunc.findById(url);
      if (existingById && existingById.uid === uid) {
        return url;
      }
      return this.ensureWorkspaceFolder(uid, url, 'root');
    }

    const folderName =
      (event?.default_folder && event.default_folder.trim()) ||
      (event?.name && event.name.trim()) ||
      'Event Submissions';

    return this.ensureWorkspaceFolder(uid, folderName, 'root');
  }

  async checkEvent(eid, parent_id, uid) {
    let response_result = {
      result: false,
      message: ""
    }
    const eventDetail = await this.eventFunc.findOneEvent({ eid: eid, parent: parent_id });

    if (!eventDetail) {
      response_result.message = "This Event has improper event id along with parent id provided"
      return response_result
    }
    const contents_list = await this.voteFunc.findContentListAggregates([
      {
        $match: { status: "Approved", eid: parent_id },
      },
      {
        $lookup: {
          from: "votes",
          localField: "cont_id",   // cont_id from contents
          foreignField: "cont_id", // cont_id from votes
          as: "votes"
        }
      },
      {
        $addFields: {
          voteCount: { $size: "$votes" },              // total votes
          uids: { $map: { input: "$votes", as: "v", in: "$$v.uid" } } // extract all voter uids
        }
      },
      {
        $project: {
          _id: 0,
          // cont_id: 1,
          // eid: 1,
          // name: 1,
          author_name: 1,
          // content: 1,
          voteCount: 1,
          uid: 1,
          // email: 1
        }
      }, {
        $sort: { voteCount: -1 }
      }
    ]);

    const existingUser = await Promise.all(
      contents_list.map(async (profiles) => {
        // get the user list for this uid
        const users = await this.userFunc.userListByData({ uid: profiles.uid });
        // return the first one (or null if empty)
        return users[0] || null;
      })
    );

    let count = 0;
    // console.log("events==============>", contents_list) 
    if (existingUser.length === 0) {
      response_result.message = "Voting has not been started. Wait for sometime. Thank You"
    }
    for (let members of existingUser) {
      if (members.uid === uid && (count + 1 <= eventDetail.sh_list)) {
        response_result.result = true
      }
      response_result.message = "This user is not qualified for this event or Either Previous Stage of competition is yet not released"
      count++
    }

    return response_result

  }

  async submit(req, res, token_data) {
    try {
      let {
        type,
        storyName,
        eid,
        storyContent,
        url,
        page_id,
        isOriginalWork,
        parent_id,
        event_content,
        backgroundImage,
        category,
        coverImage,
        destination,
        episodeNumber,
        publisher,
        wordCount,
        h_title,
      } = req.body;

      const todaysdate = moment().local().unix();
      let result;
      const event = await this.eventFunc.findOneEvent({ eid });
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      const allowMultiple = event.multiple_content !== false;

      if (event.episode_wise === true && allowMultiple) {
        if (!h_title || !String(h_title).trim()) {
          return res.status(400).json({ message: "Please provide the h_title" });
        }
      }
      if (eid != "") {

        // console.log("parent_id:================>", (!parent_id || parent_id === "") , event.parent , event)
        const eventParentId = event.parent || event.parent_id || "";
        parent_id = parent_id || eventParentId;
        if (eventParentId !== "" && parent_id === "") {
          return res.status(400).json({ message: "Please provide the parent event eid" });
        }

        const now = Number(todaysdate); // make sure todaysdate is number
        const start = Number(event.st_dt);
        const end = Number(event.en_dt);

        if (now > end) {
          return res.status(400).json({ message: "Event has already ended", todaysdate: now, en_dt: end });
        }

        if (now < start) {
          return res.status(400).json({ message: "Event has not yet started", todaysdate: now, st_dt: start });
        }

        if (parent_id != "") {
          // const parentEventDetail = await this.eventFunc.findOneEvent({eid : parent_id})
          // if(!parentEventDetail){
          //    return res.status(400).json({ message: "Please provide the correct Parent eid" });
          // }

          let parentContent = await this.contentFunc.findOneEvenTContentAll({ eid: parent_id, uid: token_data.uid, event_content: event_content });
          console.log("parentContent======>", { eid: parent_id, uid: token_data.uid, event_content: event_content }, parentContent)
          if (parentContent.length === 0) {
            return res.status(400).json({
              status: 400,
              message: 'You have not participated the previous competition or wrong eid provided for present event or parent event'
            })
          }
          result = await this.checkEvent(eid, parent_id, token_data.uid)
          if (!result.result) {
            return res.status(400).json({
              status: 400,
              message: result.message
            })
          }
        }
      }


      // return res.status(200).json({ message: "Testing" });



      // page_id = page_id ? page_id : "";

      const workspaceFolderId = await this.resolveWorkspaceFolderId(
        token_data.uid,
        url,
        event
      );

      let contents = {
        uid: token_data.uid,
        eid: eid,
        cont_id: storyName.split(" ").join("_").trim()+"_"+gen(10),
        type,
        pid: event.pid,
        name: storyName,
        author_name: token_data.full_name,
        content: storyContent,
        url: workspaceFolderId,
        event_content,
        orgin_content: isOriginalWork,
        backgroundImage,
        category,
        coverImage,
        destination,
        episodeNumber,
        publisher,
        wordCount,
        parent_id: parent_id || "",
        h_title: event.episode_wise
          ? (allowMultiple ? String(h_title || "").trim() : "")
          : "",
      }
      let existingContent = await this.contentFunc.findOneEvenTContentAll({ eid: eid, uid: token_data.uid, event_content: event_content });

      console.log("existingUser=========>", existingContent)
      if (existingContent.length > 0 && !allowMultiple && event.episode_wise === false) {
        return res.status(200).json({
          status: 200,
          message: 'This User has already submitted the content for this event'
        })
      }

      if (existingContent.length > 0 && !allowMultiple && event.episode_wise === true) {
        const seriesTitle = existingContent.find(c => c.h_title)?.h_title;
        if (seriesTitle && h_title && String(h_title).trim() !== String(seriesTitle).trim()) {
          return res.status(400).json({
            status: 400,
            message: 'You must continue the same novel for this event',
          });
        }
      }

      if (event.episode_wise === true) {
          episodeNumber = episodeNumber === "" ? "1" : String(episodeNumber).trim();
          const normalizedNum = parseInt(episodeNumber, 10);
          if (Number.isNaN(normalizedNum) || normalizedNum < 1) {
            return res.status(400).json({
              status: 400,
              message: 'Episode number must be a positive integer',
            });
          }
          episodeNumber = String(normalizedNum);
          const duplicateEpisode = existingContent.some(c => {
            const existing = parseInt(String(c.episodeNumber || '').trim(), 10);
            return !Number.isNaN(existing) && existing === normalizedNum;
          });
          if (duplicateEpisode) {
            return res.status(400).json({
              status: 400,
              message: `Episode number ${episodeNumber} already exists for this event`,
            });
          }
          contents.episodeNumber = episodeNumber;
      }

      // ── Workspace Integration: Save as JSON file ──
      const jsonData = Buffer.from(JSON.stringify({ title: storyName, content: storyContent }));
      const fileSize = jsonData.length;
      const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024;

      const storageInfo = await this.workspaceFileFunc.getStorageInfo(token_data.uid);
      if (storageInfo.used_bytes + fileSize > STORAGE_LIMIT_BYTES) {
          return res.status(402).json({
              status: 402,
              message: 'Storage full. You have to pay to continue saving files to the workspace.',
              exceeded: true,
          });
      }

      const uploadDir = path.join(__dirname, '../public/workspace');
      if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
      }

      const storedName = `${this.sanitizeFileName(destination || storyName)}_${Date.now()}.json`;
      const physicalPath = path.join(uploadDir, storedName);
      fs.writeFileSync(physicalPath, jsonData);

      const rawText = storyContent ? storyContent.replace(/<[^>]+>/g, '').substring(0, 150) : '';

      const wsFileRecord = {
          file_id: gen(14),
          uid: token_data.uid,
          folder_id: workspaceFolderId,
          original_name: storyName,
          stored_name: storedName,
          file_path: `/public/workspace/${storedName}`,
          mime_type: 'application/json',
          ext: 'json',
          size_bytes: fileSize,
          is_content: true,
          excerpt: rawText,
          createdAt: String(moment().unix()),
          updatedAt: String(moment().unix()),
      };
      await this.workspaceFileFunc.insertFile(wsFileRecord);


      // console.log("contents:================>", contents);
      await this.contentFunc.ContentInsert(contents);
      return res.status(200).json({
        message: 'Content Submitted wait for Editor to respond'
      })
    } catch (err) {
      console.log("error=====>", err);
      return res.status(500).json({ message: 'Error submitting content', err });
    }
  }

  async update(req, res) {
    try {

      const data = req.body.data
      await this.contentFunc.ContentUpdate({ ...req.body }, { ...data });
      return res.status(200).json({
        message: 'Content Submitted wait for Editor to respond'
      })
    } catch (err) {
      return res.status(500).json({ message: 'Error updating content', error });
    }
  }

  async listContents(req, res, token_data) {
    try {
      const data = req.body;
      const { skip, limit, page } = gobalPagination.pagination(req);
      const sortBy = data.sortBy || { createdAt: -1 };
      const isWriterScope = ["writer", "both", "user"].includes(token_data.role);

      if (
        (data.uid === undefined || token_data.uid !== data.uid) &&
        token_data.role !== "admin" &&
        token_data.role !== "manager" &&
        token_data.role !== "publisher"
      ) {
        return res.status(404).json({ message: "User trying to access other users content" });
      }

      const matchFilter = isWriterScope
        ? { uid: token_data.uid, ...(data.filter || {}) }
        : { ...(data.filter || {}) };

      

      const rawLists = await this.contentFunc.findUserEventAggregates(
        this._contentListPipeline(matchFilter, sortBy)
      );
      console.log("rawLists===============>", rawLists);
      const episodeWiseMap = await this._getEpisodeWiseMap(
        rawLists.map((item) => item.eid)
      );

      // Single content detail (by cont_id) — return with episodes when episode_wise
      if (data.filter?.cont_id) {
        const item = rawLists[0];
        if (!item) {
          return res.status(200).json({
            message: "Content not found",
            lists: [],
            pagination: { totalContents: 0, totalPages: 0, currentPage: page, pageSize: limit, next: false },
          });
        }

        let seriesItems = rawLists;
        if (episodeWiseMap[item.eid]) {
          const seriesKey = item.h_title || item.cont_id;
          const eidFilter = isWriterScope
            ? { uid: token_data.uid, eid: item.eid }
            : { eid: item.eid };
          const eidContents = await this.contentFunc.findUserEventAggregates(
            this._contentListPipeline(eidFilter, sortBy)
          );
          console.log("eidContents===============>", eidContents);
          seriesItems = eidContents.filter(
            (i) => (i.h_title || i.cont_id) === seriesKey
          );
        }

        const enriched = this._enrichSingleContent(item, seriesItems, episodeWiseMap);
        return res.status(200).json({
          message: "Content detail fetched",
          lists: [enriched],
          pagination: { totalContents: 1, totalPages: 1, currentPage: 1, pageSize: limit, next: false },
        });
      }

      const groupedLists = this._groupContentsByEpisodeWise(rawLists, episodeWiseMap);
      const totalContents = groupedLists.length;
      const totalPages = Math.ceil(totalContents / limit) || 0;
      const lists = groupedLists.slice(skip, skip + limit);

      console.log("lists====================>zxxzxz", lists.length, "of", totalContents);

      return res.status(200).json({
        message: "Content lists fetched",
        lists,
        pagination: {
          totalContents,
          totalPages,
          currentPage: page,
          pageSize: limit,
          next: lists.length === 0 ? false : page !== totalPages,
        },
      });
    } catch (err) {
      console.log("error=====>", err);
      return res.status(500).json({ message: "Error Fetching content", err });
    }
  }

  // Now admin or editor of the publisher can give marks for the contents on that respective event
  async addMarks(req, res, token_data) {

    try {
      const { marks, cont_id, event } = req.body;

      // const userUid = `marks.${token_data.uid}`;
      const updateData = event ? { $set: { "marks.$.score": marks, status: req.body.status } } : { $set: { status: req.body.status || "Reviewing" } };
      console.log("updateddate=============>", { cont_id }, updateData)
      //listing the contents back
      await this.contentFunc.ContentMarksUpdate({ cont_id, "marks.uid": token_data.uid }, updateData, token_data, marks)
      const data = req.body;
      const { skip, limit, page } = gobalPagination.pagination(req);
      const totalContents = await this.contentFunc.contentCount(data.filter);
      const totalPages = Math.ceil(totalContents / limit);
      let lists = await this.contentFunc.findUserEventAggregates([
        {
          $match: { eid: data.filter.eid }
        },
        {
          $addFields: {
            totalMarks: {
              $sum: {
                $map: {
                  input: { $ifNull: ["$marks", []] },  // ensure marks is always an array
                  as: "m",
                  in: {
                    $sum: {
                      $map: {
                        input: { $objectToArray: "$$m" }, // { "uid": score } -> [{k, v}]
                        as: "kv",
                        in: "$$kv.v" // get the score
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            cont_id: 1,
            eid: 1,
            name: 1,
            content: 1,
            totalMarks: 1,
            uid: 1,
            status: 1,
            author_name: 1,
            createdAt: 1,
            updatedAt: 1,
            marks: 1
          }
        },

        {
          $sort: data.sortBy
        },
        { $skip: skip },
        { $limit: limit }
      ]);
      return res.status(200).json({
        message: 'Content lists fetched',
        lists: lists,
        pagination: {
          totalContents,
          totalPages,
          currentPage: page,
          pageSize: limit,
          next: lists.length === 0 ? false : page === totalPages ? false : true
        }
      })
    } catch (err) {
      console.log("error=====>", err);
      return res.status(500).json({ message: 'Error Fetching content', err });
    }


  }

  async fetchEventOneContent(req, res, token_data) {
    try {
      const now = moment();
      const { eid, cont_id } = req.query;

      if (!cont_id) {
        return res.status(400).json({
          status: 400,
          message: "Please provide content id",
        });
      }

      const contentCheck = await this.contentFunc.findOneEvenTContentOne({ cont_id });

      if (!contentCheck) {
        return res.status(200).json({
          status: 200,
          message: "Please provide correct content id",
          lists: {},
        });
      }

      //  Case 1: eid is empty but cont_id present
      if (!eid) {
        return res.status(200).json({
          status: 200,
          message: "Content is fetched",
          lists: [contentCheck],
        });
      }

      //  Case 2: eid is present
      const eventCheck = await this.eventFunc.findOneEvent({ eid });
      console.log("eventcheck========>", eventCheck);

      if (eventCheck?.result) {
        // assuming `result` means event ended
        return res.status(200).json({
          status: 200,
          message: "This event has already ended. Thanks for your contribution.",
          lists: {},
        });
      }


      const lists = await this.contentFunc.findUserEventAggregates([
        { $match: { eid, cont_id } },
        { $unwind: "$marks" },
        { $match: { "marks.uid": token_data.uid } },
      ]);

      if (lists && lists.length > 0) {
        return res.status(200).json({
          status: 200,
          message: "Content is fetched",
          lists,
        });
      }


      return res.status(200).json({
        status: 200,
        message: "Content is fetched",
        lists: [contentCheck],
      });
    } catch (err) {
      console.log("error=====>", err);
      return res.status(500).json({
        message: "Error fetching content",
        error: err.message || err,
      });
    }
  }


  // async fetchEventOneContent(req, res, token_data){
  //   try {
  //       let now = moment();
  //       const eid = req.query.eid;
  //       const cont_id = req.query.cont_id;
  //       let contentCheck = await this.contentFunc.findOneEvenTContentOne({ cont_id });
  //       if (!contentCheck) {
  //         return res
  //           .status(200)
  //           .json({ status: 200, message: "Please provide correct content id", lists: {} });
  //       }
  //       if(eid === "" && cont_id){
  //          return res.status(200).json({
  //               message: 'Content is fetched',
  //               lists: [contentCheck] })
  //       }
  //       }else if(eid !== "" && cont_id){
  //          let eventCheck = await this.eventFunc.findOneEvent({ eid });
  //       console.log("eventcheck========>", eventCheck)
  //       if (eventCheck.result) {
  //         return res
  //           .status(200)
  //           .json({ status: 200, message: "This event was already end. Thanks for contribution", lists: {} });
  //       }
  //        return res
  //           .status(200)
  //           .json({ status: 200, message: "This event was already end. Thanks for contribution", lists: {} });


  //       let lists = await this.contentFunc.findUserEventAggregates( [
  //         {
  //           $match :{ eid , cont_id}
  //         },{$unwind: "$marks"},
  //           {
  //             $match : {

  //                 "marks.uid": token_data.uid

  //             }
  //           }

  //       ] )
  //       if(lists.length > 0 ){
  //         return res.status(200).json({
  //               message: 'Content is fetched',
  //               lists: lists })
  //       }
  //       return res.status(200).json({
  //               message: 'Content is fetched',
  //               lists: [contentCheck] })
  //       }



  //   }catch (err) {
  //     console.log("error=====>", err);
  //     return res.status(500).json({ message: 'Error Fetching content', err });
  //   }

  // }

  //<<<<<===================================================== Notice Methods =================================================================>>>>
  async createNotice(req, res, token_data) {
    if (req.body.notice_create) {
      await this.noticeFunc.insertNotice(req.body.data);
    }


    let def = await this.userFunc.userList(req.body.mail.filter, req.body.mail.projections, req.body.mail.limit, req.body.mail.skip);
    // let to =["pratikdas967@gmail.com", "pratikdasnew967@gmail.com"];

    let to = def.map(items => items.email)
    // console.log("check==========>",  def.map(items=>items.email))
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: req.body.mail.subject,
      html: `
        <!DOCTYPE html>
        <html lang="bn">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${req.body.mail.title}</title>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Noto Sans Bengali', sans-serif;
                background: #f2efe4;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
              }
              .email-container {
                max-width: 640px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                overflow: hidden;
                border: 2px solid #e6d4ab;
              }
              .header {
                background: linear-gradient(135deg,#fdf6e3,#f6e2b5,#f9f4dd);
                text-align: center;
                padding: 30px 20px 20px;
                border-bottom: 5px solid #c99a4e;
              }
              .header img {
                max-width: 130px;
                height: auto;
              }
              .content {
                padding: 30px 25px;
                color: #333333;
                font-size: 18px;
                line-height: 1.7;
                text-align: left;
                background: #fffdf7;
              }
              .content a {
                display: inline-block;
                margin-top: 10px;
                padding: 8px 16px;
                background: #c99a4e;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                transition: background .3s;
              }
              .content a:hover {
                background: #b1833e;
              }
              .footer {
                text-align: center;
                font-size: 14px;
                color: #666666;
                padding: 15px;
                background: #fdf6e3;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
               <img src="https://www.panchmeshali.com/logo.png" alt="পাঁচমেশালী লোগো">
                <br> </br>
                <h1 style="margin:0px"> পাঁচমেশালী  </h1>
              </div>
              <div class="content">
                ${req.body.mail.body}
              </div>
              <div class="footer">
                © ${new Date().getFullYear()} পাঁচমেশালী&nbsp;|&nbsp;এই ইমেলটি একটি স্বয়ংক্রিয় বার্তা
              </div>
            </div>
          </body>
        </html>
        `
    };
    try {
      if (req.body.send_mail) {
        await transporter.sendMail(mailOptions);
      }
      // console.log(`Email sent to ${name} (${to})`, state);
    } catch (error) {
      console.error(`Failed to send email to ${to}: ${error.message}`);
    }

    let lists = await this.noticeFunc.findAllNotice({});
    return res.status(200).json({
      message: 'Notice lists fetched',
      lists: lists
    })
  }
  async allNotice(req, res, token_data) {
    // await this.contentFunc.insertNotice(data);
    let lists = await this.noticeFunc.findAllNotice({});
    return res.status(200).json({
      message: 'Notice lists fetched',
      lists: lists
    })
  }
  async certificateFetch(req, res, token_data) {
    const { eid } = req.query;
    let message = "";
    let certificateData = {};
    let now = moment();
    let contents_list = [];

    // check event
    let eventCheck = await this.eventFunc.findOneEvent({ eid });
    if (!eventCheck) {
      return res
        .status(400)
        .json({ status: 400, message: "Please provide correct id for the event", data: {} });
    }

    // check participation
    let participateCheck = await this.contentFunc.findOneEvenTContentOne({ eid, uid: token_data.uid });
    if (!participateCheck) {
      return res
        .status(400)
        .json({ status: 400, message: "Sorry you have not participated in this event", data: {} });
    }

    // sibling check
    let eventSiblingsCheck = await this.eventFunc.findAllEvents({ parent: eid });

    // event end time check
    if (now.isBefore(moment.unix(eventCheck.en_dt))) {
      message = "The event has not ended yet";
      return res.status(200).json({ status: 200, message, data: {} });
    }
    if (!eventCheck.result) {
      message = "We are preparing for the result.Please wait for some days";
      return res.status(200).json({ status: 200, message, data: {} });
    }
    // console.log("eventCheck-=-=-=-=-=-=-=-=-=-=>", eventCheck)
    // fetch content list depending on type
    switch (eventCheck.type) {
      case "vote":
        try {
          contents_list = await this.voteFunc.findContentListAggregates([
            { $match: { eid } },
            {
              $lookup: {
                from: "votes",
                localField: "cont_id",
                foreignField: "cont_id",
                as: "votes"
              }
            },
            {
              $addFields: {
                voteCount: { $size: "$votes" },
                uids: { $map: { input: "$votes", as: "v", in: "$$v.uid" } }
              }
            },
            {
              $project: {
                _id: 0,
                author_name: 1,
                voteCount: 1,
                uid: 1
              }
            },
            { $sort: { voteCount: -1 } }
          ]);
        } catch (err) {
          return res
            .status(400)
            .json({ status: 400, message: "internal server error", data: {} });
        }
        break;

      case "number":
        contents_list = await this.contentFunc.findUserEventAggregates([
          { $match: { eid } },
          {
            $addFields: {
              totalMarks: {
                $sum: {
                  $map: {
                    input: { $ifNull: ["$marks", []] },
                    as: "m",
                    in: {
                      $sum: {
                        $map: {
                          input: { $objectToArray: "$$m" },
                          as: "kv",
                          in: "$$kv.v"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              cont_id: 1,
              eid: 1,
              name: 1,
              type: 1,
              h_title: 1,
              episodeNumber: 1,
              wordCount: 1,
              category: 1,
              content: 1,
              totalMarks: 1,
              uid: 1,
              status: 1,
              createdAt: 1,
              updatedAt: 1
            }
          },
          { $sort: { totalMarks: -1 } } // <- fallback if sortBy not provided
        ]);
        break;
    }

    // function to set certificate data
    function setParticipationData(name, uid, position) {
      message = "Thanks for participating";
      certificateData = {
        writerName: name,
        competitionName: eventCheck.name,
        editorName: eventCheck.team,
        participantName: name,
        logoUrl: eventCheck.logo,
        position
      };
    }

    // loop through content users
    const existingUsers = await Promise.all(
      contents_list.map(async (profile) => {
        const users = await this.userFunc.userListByData({ uid: profile.uid });
        return users[0] || null;
      })
    );

    let count = 0;

    for (let member of existingUsers) {
      console.log("count=====================>", count)

      if (!member) {
        count++;
        continue;
      }

      const { full_name: name, uid } = member;
      if (eventSiblingsCheck.length > 0) {

        if (count + 1 <= eventCheck.sh_list) {
          if (eventSiblingsCheck[0].result && uid === token_data.uid) {
            setParticipationData(name, uid, count + 1);

            break;
          }
          message = "You are still in the competition for the next round";
          // count++;
        } else if (uid === token_data.uid) {
          setParticipationData(name, uid, count + 1);
          break;
        }
      } else {
        if (uid === token_data.uid) {
          setParticipationData(name, uid, count + 1);
          break;
        }
      }

      count++;
    }

    return res.status(200).json({ status: 200, message, data: certificateData });
  }

  // <<<<<<=================== Category Methods ==========================>>>>>
  async createCategoryByPublisher(req, res, token_data) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ status: 400, message: "Category name is required", data: {} });
      }

      let isGlobal = false;
      let pid = "";

      // Admins & Managers create global categories
      if (token_data.role === "admin" || token_data.role === "manager") {
        isGlobal = true;
      } else if (token_data.role === "publisher") {
        isGlobal = false;
        pid = token_data.uid; // Bound exclusively to this publisher
      }

      const lowerName = name.toLowerCase();

      // Check if category already exists identically based on context
      const query = { name: lowerName };
      if (!isGlobal) {
        query.pid = pid; // check locally for publisher
      } else {
        query.is_global = true; // check globally for admins
      }

      const existingCategory = await this.contentFunc.findOneCategory(query);

      if (existingCategory) {
        return res.status(409).json({ status: 409, message: "Category already exists", data: {} });
      }

      await this.contentFunc.insertCategory({
        name: lowerName,
        is_global: isGlobal,
        pid: pid,
        created_by: token_data.uid
      });

      return res.status(201).json({ status: 201, message: "Category created successfully", data: { name: lowerName, is_global: isGlobal } });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: 500, message: "Internal Server Error", data: {} });
    }
  }

  async createCategoryByUser(req, res, token_data) {
    try {
      const { name } = req.body;
      if (!name) {
         return res.status(400).json({ status: 400, message: "Category name is required", data: {} });
      }

      const lowerName = name.toLowerCase();

      // Writers create global categories uniquely if they don't exist
      const existingCategory = await this.contentFunc.findOneCategory({ name: lowerName, is_global: true });
      if (existingCategory) {
         return res.status(200).json({ status: 200, message: "Category already exists in global pool", data: { name: existingCategory.name } });
      }

      // Automatically construct it globally
      await this.contentFunc.insertCategory({
         name: lowerName,
         is_global: true,
         pid: "", 
         created_by: token_data.uid
      });

      return res.status(201).json({ status: 201, message: "Global category auto-generated successfully", data: { name: lowerName } });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: 500, message: "Internal Server Error", data: {} });
    }
  }

  async getContentComments(req, res, token_data) {
    try {
      const { cont_id } = req.body;
      if (!cont_id) {
        return res.status(400).json({ status: 400, message: 'cont_id is required', data: [] });
      }

      const content = await this.contentFunc.findOneEvenTContentOne({ cont_id });
      if (!content) {
        return res.status(404).json({ status: 404, message: 'Content not found', data: [] });
      }

      return res.status(200).json({
        status: 200,
        message: 'Comments fetched',
        data: content.comments || [],
      });
    } catch (err) {
      console.error('getContentComments error:', err);
      return res.status(500).json({ status: 500, message: 'Error fetching comments', data: [] });
    }
  }

  async addContentComment(req, res, token_data) {
    try {
      const allowedRoles = ['publisher', 'admin', 'writer', 'both', 'manager', 'user'];
      const role = (token_data.role || '').toLowerCase();
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ status: 403, message: 'You are not allowed to comment on content', data: {} });
      }

      const { cont_id, text } = req.body;
      if (!cont_id || !text?.trim()) {
        return res.status(400).json({ status: 400, message: 'cont_id and text are required', data: {} });
      }

      const content = await this.contentFunc.findOneEvenTContentOne({ cont_id });
      if (!content) {
        return res.status(404).json({ status: 404, message: 'Content not found', data: {} });
      }

      const comment = {
        id: gen(12),
        cont_id,
        uid: token_data.uid,
        author_name: token_data.full_name || token_data.name || 'User',
        role,
        text: text.trim(),
        createdAt: String(moment().unix()),
        isReviewer: ['publisher', 'admin', 'manager'].includes(role),
      };

      await this.contentFunc.pushComment(cont_id, comment);

      return res.status(200).json({
        status: 200,
        message: 'Comment added',
        data: comment,
      });
    } catch (err) {
      console.error('addContentComment error:', err);
      return res.status(500).json({ status: 500, message: 'Error adding comment', data: {} });
    }
  }

  async listProofreadContents(req, res, token_data) {
    try {
      const role = (token_data.role || "").toLowerCase();
      if (!["admin", "manager", "publisher"].includes(role)) {
        return res.status(403).json({ status: 403, message: "Access denied", lists: [], pagination: {} });
      }

      const { skip, limit, page } = gobalPagination.pagination(req);
      const search = (req.body.search || "").trim().toLowerCase();
      const dateFilter = req.body.dateFilter || "all";

      let matchFilter = { status: "Approved" };

      if (role === "publisher") {
        const publisher = await this.publisherFunc.findOnePublisher({
          uids: { $in: [token_data.uid] },
        });
        if (!publisher?.pid) {
          return res.status(403).json({ status: 403, message: "No publisher company found", lists: [], pagination: {} });
        }
        const events = await this.eventFunc.findAllEvents({ pid: publisher.pid });
        const eids = events.map((e) => e.eid).filter(Boolean);
        if (!eids.length) {
          return res.status(200).json({
            message: "No approved content",
            lists: [],
            pagination: { totalContents: 0, totalPages: 0, currentPage: page, pageSize: limit, next: false },
          });
        }
        matchFilter.eid = { $in: eids };
      }

      let lists = await this.contentFunc.findUserEventAggregates(
        this._contentListPipeline(matchFilter, { updatedAt: -1, createdAt: -1 })
      );

      if (search) {
        lists = lists.filter(
          (item) =>
            item.name?.toLowerCase().includes(search) ||
            item.author_name?.toLowerCase().includes(search)
        );
      }

      if (dateFilter !== "all") {
        const now = moment();
        lists = lists.filter((item) => {
          const ts = Number(item.createdAt);
          if (!ts) return false;
          const d = moment.unix(ts);
          if (dateFilter === "today") return d.isSame(now, "day");
          if (dateFilter === "week") return d.isAfter(now.clone().subtract(7, "days"));
          if (dateFilter === "month") return d.isSame(now, "month");
          return true;
        });
      }

      const totalContents = lists.length;
      const totalPages = Math.ceil(totalContents / limit) || 0;
      const paged = lists.slice(skip, skip + limit);

      const prMap = await this.proofReadFunc.getPrMapForContIds(paged.map((item) => item.cont_id));
      const listsWithPr = paged.map((item) => ({
        ...item,
        pr: !!prMap[item.cont_id],
      }));

      return res.status(200).json({
        message: "Approved contents fetched",
        lists: listsWithPr,
        pagination: {
          totalContents,
          totalPages,
          currentPage: page,
          pageSize: limit,
          next: paged.length === 0 ? false : page !== totalPages,
        },
      });
    } catch (err) {
      console.error("listProofreadContents error:", err);
      return res.status(500).json({ message: "Error fetching proofread contents", err });
    }
  }

  async proofreadAI(req, res, token_data) {
    try {
      const role = (token_data.role || "").toLowerCase();
      if (!["admin", "manager", "publisher"].includes(role)) {
        return res.status(403).json({ status: 403, message: "Access denied", data: {} });
      }

      const { cont_id, content } = req.body;
      if (!cont_id || !content?.trim()) {
        return res.status(400).json({ status: 400, message: "cont_id and content are required", data: {} });
      }

      const contentItem = await this.contentFunc.findOneEvenTContentOne({ cont_id });
      if (!contentItem || contentItem.status !== "Approved") {
        return res.status(404).json({ status: 404, message: "Approved content not found", data: {} });
      }

      if (!(await this._canProofreadContent(token_data, contentItem))) {
        return res.status(403).json({ status: 403, message: "Not authorized for this content", data: {} });
      }

      const result = await proofreadWithAI(content);

      return res.status(200).json({
        status: 200,
        message: "Proofread complete",
        data: result,
      });
    } catch (err) {
      console.error("proofreadAI error:", err);
      const msg = err.message?.includes("AI_API_KEY")
        ? "AI service not configured. Set AI_API_KEY in .env"
        : err.message || "AI proofread failed";
      return res.status(500).json({ status: 500, message: msg, data: {} });
    }
  }

  async saveProofreadContent(req, res, token_data) {
    try {
      const role = (token_data.role || "").toLowerCase();
      if (!["admin", "manager", "publisher"].includes(role)) {
        return res.status(403).json({ status: 403, message: "Access denied", data: {} });
      }

      const { cont_id, content, mode } = req.body;
      if (!cont_id || content === undefined || content === null) {
        return res.status(400).json({ status: 400, message: "cont_id and content are required", data: {} });
      }

      const contentItem = await this.contentFunc.findOneEvenTContentOne({ cont_id });
      if (!contentItem || contentItem.status !== "Approved") {
        return res.status(404).json({ status: 404, message: "Approved content not found", data: {} });
      }

      if (!(await this._canProofreadContent(token_data, contentItem))) {
        return res.status(403).json({ status: 403, message: "Not authorized for this content", data: {} });
      }

      const trimmed = String(content).trim();
      const wordCount = this._countWords(trimmed);

      await this.contentFunc.updateContentByContId(cont_id, {
        content: trimmed,
        wordCount,
      });

      return res.status(200).json({
        status: 200,
        message: `Content saved (${mode || "manual"})`,
        data: { cont_id, wordCount },
      });
    } catch (err) {
      console.error("saveProofreadContent error:", err);
      return res.status(500).json({ status: 500, message: "Error saving content", data: {} });
    }
  }

  async markProofreadDone(req, res, token_data) {
    try {
      const role = (token_data.role || "").toLowerCase();
      if (!["admin", "manager", "publisher"].includes(role)) {
        return res.status(403).json({ status: 403, message: "Access denied", data: {} });
      }

      const { cont_id, content, mode } = req.body;
      if (!cont_id) {
        return res.status(400).json({ status: 400, message: "cont_id is required", data: {} });
      }

      const contentItem = await this.contentFunc.findOneEvenTContentOne({ cont_id });
      if (!contentItem || contentItem.status !== "Approved") {
        return res.status(404).json({ status: 404, message: "Approved content not found", data: {} });
      }

      if (!(await this._canProofreadContent(token_data, contentItem))) {
        return res.status(403).json({ status: 403, message: "Not authorized for this content", data: {} });
      }

      const event = await this.eventFunc.findOneEvent({ eid: contentItem.eid });
      const pid = event?.pid || "";

      if (content !== undefined && content !== null) {
        const trimmed = String(content).trim();
        await this.contentFunc.updateContentByContId(cont_id, {
          content: trimmed,
          wordCount: this._countWords(trimmed),
        });
      }

      await this.proofReadFunc.upsertProofRead({
        cont_id,
        eid: contentItem.eid,
        pid,
        marked_by: token_data.uid,
      });

      return res.status(200).json({
        status: 200,
        message: "Proof read marked as done",
        data: { cont_id, eid: contentItem.eid, pid, pr: true },
      });
    } catch (err) {
      console.error("markProofreadDone error:", err);
      return res.status(500).json({ status: 500, message: "Error marking proofread done", data: {} });
    }
  }

  async _resolvePublisherPid(token_data) {
    if (["admin", "manager"].includes((token_data.role || "").toLowerCase())) {
      return null;
    }
    const publisher = await this.publisherFunc.findOnePublisher({
      uids: { $in: [token_data.uid] },
    });
    return publisher?.pid || null;
  }

  _groupContentsForBookPreview(contents) {
    const byWriter = new Map();

    for (const item of contents) {
      const uid = item.uid || "unknown";
      if (!byWriter.has(uid)) {
        byWriter.set(uid, {
          uid,
          author_name: item.author_name || "Unknown",
          series: new Map(),
        });
      }
      const writer = byWriter.get(uid);
      const seriesKey = item.h_title || item.cont_id;
      if (!writer.series.has(seriesKey)) {
        writer.series.set(seriesKey, {
          h_title: seriesKey,
          title: item.name || "Untitled",
          coverImage: item.coverImage || "",
          episodes: [],
        });
      }
      writer.series.get(seriesKey).episodes.push({
        cont_id: item.cont_id,
        name: item.name,
        episodeNumber: item.episodeNumber,
        content: item.content,
        wordCount: item.wordCount,
        createdAt: item.createdAt,
      });
    }

    return Array.from(byWriter.values()).map((w) => ({
      uid: w.uid,
      author_name: w.author_name,
      series: Array.from(w.series.values()).map((s) => ({
        ...s,
        episodes: s.episodes.sort(
          (a, b) =>
            parseInt(a.episodeNumber || "0", 10) -
            parseInt(b.episodeNumber || "0", 10)
        ),
        title: s.episodes[0]?.name || s.title,
      })),
    }));
  }

  async listPublishPreviewEvents(req, res, token_data) {
    try {
      const role = (token_data.role || "").toLowerCase();
      if (!["admin", "manager", "publisher"].includes(role)) {
        return res.status(403).json({ status: 403, message: "Access denied", events: [], pagination: {} });
      }

      const { skip, limit, page } = gobalPagination.pagination(req);
      const search = (req.body.search || "").trim().toLowerCase();

      const eventFilter = {
        is_app: false,
        is_book: true,
        episode_wise: true,
      };

      const publisherPid = await this._resolvePublisherPid(token_data);
      if (role === "publisher") {
        if (!publisherPid) {
          return res.status(403).json({ status: 403, message: "No publisher company found", events: [], pagination: {} });
        }
        eventFilter.pid = publisherPid;
      }

      let events = await this.eventFunc.findAllEvents(eventFilter);

      if (search) {
        events = events.filter(
          (e) =>
            e.name?.toLowerCase().includes(search) ||
            e.description?.toLowerCase().includes(search)
        );
      }

      const enriched = [];
      for (const ev of events) {
        const contents = await this._getApprovedContentsMarkedPr(ev.eid, ev.pid);
        const writers = new Set(contents.map((c) => c.uid).filter(Boolean));
        if (contents.length === 0) continue;

        enriched.push({
          eid: ev.eid,
          name: ev.name,
          description: ev.description,
          logo_url: ev.logo_url,
          event_type: ev.event_type,
          st_dt: ev.st_dt,
          en_dt: ev.en_dt,
          pid: ev.pid,
          writerCount: writers.size,
          episodeCount: contents.length,
        });
      }

      const totalContents = enriched.length;
      const totalPages = Math.ceil(totalContents / limit) || 0;
      const paged = enriched.slice(skip, skip + limit);

      return res.status(200).json({
        message: "Publish preview events fetched",
        events: paged,
        pagination: {
          totalContents,
          totalPages,
          currentPage: page,
          pageSize: limit,
          next: paged.length === 0 ? false : page !== totalPages,
        },
      });
    } catch (err) {
      console.error("listPublishPreviewEvents error:", err);
      return res.status(500).json({ message: "Error fetching publish preview events", err });
    }
  }

  async getPublishPreviewBook(req, res, token_data) {
    try {
      const role = (token_data.role || "").toLowerCase();
      if (!["admin", "manager", "publisher"].includes(role)) {
        return res.status(403).json({ status: 403, message: "Access denied", data: {} });
      }

      const { eid } = req.body;
      if (!eid) {
        return res.status(400).json({ status: 400, message: "eid is required", data: {} });
      }

      const event = await this.eventFunc.findOneEvent({ eid });
      if (!event || event.is_app !== false || event.is_book !== true || event.episode_wise !== true) {
        return res.status(404).json({
          status: 404,
          message: "Event not eligible for book publish preview",
          data: {},
        });
      }

      const publisherPid = await this._resolvePublisherPid(token_data);
      if (role === "publisher" && event.pid !== publisherPid) {
        return res.status(403).json({ status: 403, message: "Not authorized for this event", data: {} });
      }

      const contents = await this._getApprovedContentsMarkedPr(eid, event.pid);

      if (!contents.length) {
        return res.status(404).json({
          status: 404,
          message: "No approved proofread content for this event",
          data: {},
        });
      }

      const writers = this._groupContentsForBookPreview(contents);

      return res.status(200).json({
        status: 200,
        message: "Book preview data fetched",
        data: {
          event: {
            eid: event.eid,
            name: event.name,
            description: event.description,
            logo_url: event.logo_url,
            event_type: event.event_type,
            st_dt: event.st_dt,
            en_dt: event.en_dt,
          },
          writers,
          stats: {
            writers: writers.length,
            episodes: contents.length,
          },
        },
      });
    } catch (err) {
      console.error("getPublishPreviewBook error:", err);
      return res.status(500).json({ status: 500, message: "Error fetching book preview", data: {} });
    }
  }
}

module.exports = ContentController;
