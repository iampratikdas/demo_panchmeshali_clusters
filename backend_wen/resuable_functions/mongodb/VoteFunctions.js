//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Import Default
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const moment = require("moment");
const Voteschema = require("../../models/monogdb/Votes");
const Contentschema = require("../../models/monogdb/Contents");
const Setup = require("../../db/mongodb/setupDatabase");
class VoteFunctions {
    constructor() {
        (async () => {
            this.votemodel = await Voteschema(await Setup.getConnection());
            this.contentmodel = await Contentschema(await Setup.getConnection());
        })()
    }

    async findOneVoteById(contentId) {
        return await this.votemodel.findOne({ cont_id: contentId }).lean()
    }
    async findOneEvenTVoteById(eid) {
        return await this.votemodel.findOne({ eid: eid }).lean()
    }
    async findOneEvenTVoteAll(data) {
        return await this.votemodel.find(data).lean()
    }
    async findOneEvenTVoteOne(data) {
        return await this.votemodel.findOne(data).lean()
    }
    async findContentListAggregates(data) {
        // console.log("result====>", data)
        return await this.contentmodel.aggregate(data)
    }
    async findVoteListAggregates(data) {
        // console.log("result====>", data)
        return await this.votemodel.aggregate(data)
    }
    async VoteInsert(voteData) {
        try {
            // console.log("contents----------------------->", voteData)
            return await this.votemodel.insertOne(voteData);
        } catch (error) {
            console.error("Error inserting content:", error);
            throw new Error("Failed to insert content", error);
        }
    }
    async VoteUpdate(voteData, data) {
        try {
            return await this.votemodel.updateOne({ ...data }, { $set: { name: voteData } });
        } catch (error) {
            //console.error("Error inserting content:", error);
            throw new Error("Failed to update content");
        }
    }
}


module.exports = VoteFunctions;