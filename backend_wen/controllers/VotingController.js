const fs = require("fs");
const path = require("path");
const moment = require("moment");

const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
require('dotenv').config();
// Utility imports
const gen = require("../utils/GenKey.js");
const Config = require("../utils/Config.js");

const { encrypt, verify } = require("../utils/hashing.js");
const {
  GenUserToken,
  GetUserAuthorization,
} = require("../utils/Authorization.js");
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

class VotingController {
  constructor(module) {
    console.log("Voting controller is active now==========>");
    this.userFunc = module.usersFunctions;
    this.contentFunc = module.contentFunctions;
    this.voteFunc = module.voteFunctions;
    this.eventFunc =  module.eventFunctions;
  }
  

  async contentListForVoting(req, res) {
    try {
      let result = await this.userFunc.checkUser(req);
      const contents_list = await this.voteFunc.findContentListAggregates([
      {
        $match: { status: req.query.status, eid: req.query.eid },
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
          _id: 1,
          cont_id: 1,
          eid: 1,
          name: 1,
          author_name: 1,
          content: 1,
          voteCount: 1,
          uids: 1
        }
      },{
        $sort: { voteCount: -1 }
      }
    ]);

    const currentUserId = result && result.uid;

    const contentsWithVoteCheck = contents_list.map(content => ({
      ...content,
      hasVoted: content.uids.includes(currentUserId)
    }));

      return res
        .status(201)
        .json({
          status: 201, message: "Contents list fetched", data: {
            user_vote: result ? true : false,
            contentsWithVoteCheck,
          }
        });
    } catch (error) {
      console.error("Error during signup:", error);
      res
        .status(500)
        .json({ status: 500, message: "Internal server error", data: {} });
    }
  }

  async topContents(req, res) {
    try {
      const contents_list = await this.voteFunc.findVoteListAggregates([
        {
          $match: { eid: req.query.eid }
        },
        {
          $group: {
            _id: "$cont_id",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "contents",             // name of the collection
            localField: "_id",            // field from current pipeline (_id === cont_id)
            foreignField: "cont_id",      // field in contents collection
            as: "contentDetails"          // output array field
          }
        },
        {
          $unwind: "$contentDetails"
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: Number(req.query.top) || 10 
        }
      ]);


      return res
        .status(201)
        .json({
          status: 201, message: "Top Contents list fetched", data: {
            // user_vote: result ? true : false,
            contents_list,
          }
        });
    } catch (err) {
      console.log("error==============>", err)
      res
        .status(500)
        .json({ status: 500, message: "Internal server error", data: err });
    }
  }

  async voteAContent(req, res, token_data) {
    try {
      console.log("body===========>", {
        uid: token_data.uid,
        cont_id: req.body.cont_id,
        eid: req.body.eid
      })
      let result = await this.userFunc.checkUser(req);
      let exist_vote = await this.voteFunc.findOneEvenTVoteOne({
        uid: token_data.uid,
        cont_id: req.body.cont_id,
        eid: req.body.eid
      })
      // console.log("existing_vote==========>", exist_vote)
      if (exist_vote) {
        return res.status(401).json({
          status: 401,
          message: "You have already voted for this content",
          data: {},
        });
      }
      let parentEvent = await this.eventFunc.findOneEvent({ eid : req.body.eid});
      if (!parentEvent) {
        return res.status(404).json({
          message: "Event not found",
        });
      }
      let contentCheck = await this.contentFunc.findOneContentById(req.body.cont_id)
      if (!contentCheck) {
        return res.status(404).json({
          message: "Content not found",
        });
      }
      await this.voteFunc.VoteInsert({
        uid: token_data.uid,
        cont_id: req.body.cont_id,
        eid: req.body.eid,
        vid: gen(10)
      })


      const contents_list = await this.voteFunc.findContentListAggregates([
  {
    $match: { status: "Approved", eid: "12345" },
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
      _id: 1,
      cont_id: 1,
      eid: 1,
      name: 1,
      author_name: 1,
      content: 1,
      voteCount: 1,
      uids: 1
    }
  },{
    "$sort" : { createdAt: -1 }
  }
]);

// 2️⃣ Add "hasVoted" check for current user
const currentUserId = result && result.uid;

const contentsWithVoteCheck = contents_list.map(content => ({
  ...content,
  hasVoted: content.uids.includes(currentUserId)
}));


return res
        .status(201)
        .json({
          status: 201, message: "Contents list fetched", data: {
            user_vote: result ? true : false,
            contentsWithVoteCheck,
          }
        });

      // return res
      //   .status(201)
      //   .json({
      //     "message": "Voted Successfully"
      //   })
    } catch (err) {
      console.log(err)
      res
        .status(500)
        .json({ status: 500, message: "Internal server error", data: err });
    }

  }




}

module.exports = VotingController;