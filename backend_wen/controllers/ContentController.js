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
    // this.paginationFunc = modelfunctions.pagination;
  }

  async checkEvent(eid, parent_eid, uid) {
    let response_result = {
      result: false,
      message: ""
    }
    const eventDetail = await this.eventFunc.findOneEvent({ eid: eid, parent: parent_eid });

    if (!eventDetail) {
      response_result.message = "This Event has improper event id along with parent id provided"
      return response_result
    }
    const contents_list = await this.voteFunc.findContentListAggregates([
      {
        $match: { status: "Approved", eid: parent_eid },
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
        event_content,
        isOriginalWork,
        parent_eid
      } = req.body;

      const todaysdate = moment().local().unix();
      let result;
      if (eid != "") {
        const event = await this.eventFunc.findOneEvent({ eid });

        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }

        if ((!parent_eid || parent_eid === "") && event.parent != "") {
          return res.status(404).json({ message: "Please provide the parent event eid" });
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

        if (parent_eid != "") {
          // const parentEventDetail = await this.eventFunc.findOneEvent({eid : parent_eid})
          // if(!parentEventDetail){
          //    return res.status(400).json({ message: "Please provide the correct Parent eid" });
          // }

          let parentContent = await this.contentFunc.findOneEvenTContentAll({ eid: parent_eid, uid: token_data.uid, event_content: event_content });
          console.log("parentContent======>", { eid: parent_eid, uid: token_data.uid, event_content: event_content }, parentContent)
          if (parentContent.length === 0) {
            return res.status(400).json({
              status: 400,
              message: 'You have not participated the previous competition or wrong eid provided for present event or parent event'
            })
          }
          result = await this.checkEvent(eid, parent_eid, token_data.uid)
          if (!result.result) {
            return res.status(400).json({
              status: 400,
              message: result.message
            })
          }
        }
      }


      // return res.status(200).json({ message: "Testing" });



      page_id = page_id ? page_id : "";
      
      const folder_id = url || "root";
      
      let contents = {
        uid: token_data.uid,
        eid: eid,
        cont_id: gen(10),
        type,
        page_id: page_id,
        name: storyName,
        author_name: token_data.full_name,
        content: storyContent,
        url: folder_id, // Save the destination folder in the `url` field
        event_content,
        orgin_content: isOriginalWork,
      }
      let existingContent = await this.contentFunc.findOneEvenTContentAll({ eid: eid, uid: token_data.uid, event_content: event_content });

      console.log("existingUser=========>", page_id)
      if (eid != "") {

        if (existingContent.length > 0) {
          return res.status(200).json({
            status: 200,
            message: 'This User has already submitted the content for this event'
          })
        }
      }

      // ── Workspace Integration: Save as JSON file ──
      // Calculate filesize
      const jsonData = Buffer.from(JSON.stringify({ title: storyName, content: storyContent }));
      const fileSize = jsonData.length;
      const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024;
      
      const storageInfo = await this.userFunc.workspaceFileFunctions.getStorageInfo(token_data.uid);
      if (storageInfo.used_bytes + fileSize > STORAGE_LIMIT_BYTES) {
          return res.status(402).json({
              status: 402,
              message: 'Storage full. You have to pay to continue saving files to the workspace.',
              exceeded: true,
          });
      }

      // Create physical JSON file
      const uploadDir = path.join(__dirname, '../../public/workspace');
      if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
      }
      const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1e6)}.json`;
      const physicalPath = path.join(uploadDir, uniqueName);
      fs.writeFileSync(physicalPath, jsonData);

      // Extract a short excerpt (strip basic HTML tags for preview)
      const rawText = storyContent ? storyContent.replace(/<[^>]+>/g, '').substring(0, 150) : '';

      // Insert WorkspaceFile record
      const wsFileRecord = {
          uid: token_data.uid,
          folder_id: folder_id,
          original_name: storyName,
          stored_name: uniqueName,
          file_path: `/public/workspace/${uniqueName}`,
          mime_type: 'application/json',
          ext: 'json',
          size_bytes: fileSize,
          is_content: true,
          excerpt: rawText
      };
      await this.userFunc.workspaceFileFunctions.insertFile(wsFileRecord);


      // console.log("contents:================>", contents);
      await this.contentFunc.ContentInsert(contents);
      return res.status(200).json({
        message: 'Content Submitted wait for Editor to respond'
      })
    } catch (err) {

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
      let totalContents;
      let totalPages;
      let lists;
      const data = req.body;
      const { skip, limit, page } = gobalPagination.pagination(req);
      console.log("token_data=============>", token_data.uid)
      if (
        (data.uid === undefined || token_data.uid !== data.uid) &&
        token_data.role !== "admin" &&
        token_data.role !== "manager") {
        return res.status(404).json({ message: 'User trying to access other users content' });
      }


      console.log("filter===============>", { $match: { ...data.filter } })
      if (token_data.role === "user") {
        totalContents = await this.contentFunc.contentCount({ uid: token_data.uid, ...data.filter });
        totalPages = Math.ceil(totalContents / limit);
        lists = await this.contentFunc.findUserEventAggregates([
          {
            $match: { uid: token_data.uid, ...data.filter }
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
              _id: 1,
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
        console.log("lists====================> user", lists, { uid: token_data.uid, ...data.filter })
      } else {

        totalContents = await this.contentFunc.contentCount(data.filter);
        totalPages = Math.ceil(totalContents / limit);
        lists = await this.contentFunc.findUserEventAggregates([
          {
            $match: { ...data.filter }
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
              _id: 1,
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
        ]
        );
        console.log("lists====================> admin", lists, {
          $match: { ...data.filter }
        })
      }

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
}

module.exports = ContentController;
