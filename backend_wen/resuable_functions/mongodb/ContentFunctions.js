//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Import Default
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const moment = require("moment");
const Contentschema = require("../../models/monogdb/Contents");
const Categoryschema = require("../../models/monogdb/Categories");
const Setup = require("../../db/mongodb/setupDatabase");
class ContentFunctions {
    constructor() {
        (async () => {
            this.contentmodel = await Contentschema(await Setup.getConnection());
            this.categoryModel = await Categoryschema(await Setup.getConnection());
        })()
    }

    async findOneContentById(contentId) {
        return await this.contentmodel.findOne({ cont_id: contentId }).lean()
    }
    async findOneEvenTContentById(eid) {
        return await this.contentmodel.findOne({ eid: eid }).lean()
    }
    async findOneEvenTContentAll(data, skip = 0, limit = 0) {
        return await this.contentmodel.find(data).skip(skip).limit(limit).lean()
    }
    async contentListByData(data, skip = 0, limit = 0) {
        return await this.contentmodel.find(data).skip(skip).limit(limit).lean()
    }
    async findOneEvenTContentOne(data) {
        return await this.contentmodel.findOne(data).lean()
    }

    async contentCount(data) {
        return await this.contentmodel.find(data).countDocuments().lean()
    }
    async findUserEventAggregates(data) {
        return await this.contentmodel.aggregate(data);
    }
    async ContentInsert(contentData) {
        try {
            return await this.contentmodel.insertOne(contentData);
        } catch (error) {
            console.error("Error inserting content:", error);
            throw new Error("Failed to insert content", error);
        }
    }
    async ContentUpdate(contentData, data) {
        try {
            return await this.contentmodel.updateOne({ ...data }, { $set: { name: contentData } });
        } catch (error) {
            throw new Error("Failed to update content");
        }
    }

    async updateContentByContId(cont_id, fields) {
        return await this.contentmodel.updateOne(
            { cont_id },
            { $set: { ...fields, updatedAt: String(moment().unix()) } }
        );
    }

    async pushComment(cont_id, comment) {
        return await this.contentmodel.updateOne(
            { cont_id },
            { $push: { comments: comment } }
        );
    }
    async ContentMarksUpdate(contentData, data, token_data, marks) {
        try {
            return await this.contentmodel.updateOne(contentData, data).then(async (rs) => {
                if (rs.matchedCount === 0) {
                    await this.contentmodel.updateOne({ cont_id: contentData.cont_id }, { $push: { marks: { uid: token_data.uid, score: marks } } })
                }
            });
        } catch (error) {
            console.error("Error updating content marks:", error);
            throw new Error("Failed to update content");
        }
    }

    // Category Hooks
    async findOneCategory(query) {
        return await this.categoryModel.findOne(query).lean();
    }
    
    async insertCategory(data) {
        try {
            return await this.categoryModel.create(data);
        } catch (error) {
            console.error("Error inserting category:", error);
            throw new Error("Failed to insert category", error);
        }
    }
}

module.exports = ContentFunctions