//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Import Default
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const moment = require("moment");
const Publisherschema = require("../../models/monogdb/Publishers");
const Contentschema = require("../../models/monogdb/Contents");
const Userschema = require("../../models/monogdb/User");
const WritersAssignedPublishersschema = require("../../models/monogdb/WritersAssignedPublishers");
const Setup = require("../../db/mongodb/setupDatabase");

class PublishersFunctions {
    constructor() {
        (async () => {
            this.publishermodel = await Publisherschema(await Setup.getConnection());
            this.contentmodel = await Contentschema(await Setup.getConnection());
            this.usermodel = await Userschema(await Setup.getConnection());
            this.assignedPublishersModel = await WritersAssignedPublishersschema(await Setup.getConnection());
        })()
    }

    async findOnePublisher(data) {
        return await this.publishermodel.findOne(data).lean()
    }
    async findAllPublishers(data = {}) {
        return await this.publishermodel.find(data).sort({ createdAt: -1 }).lean()
    }
    async publisherCount(data) {
        return await this.publishermodel.find(data).countDocuments().lean()
    }
    async publisherListByData(data, skip = 0, limit = 0) {
        return await this.publishermodel.find(data).skip(skip).limit(limit).sort({ createdAt: -1 }).lean()
    }

    /**
     * Get all publishers assigned to a writer (by writer_uid).
     * Joins with Publishers collection on pid.
     */
    async getAssignedPublishers(writer_uid) {
        try {
            return await this.publishermodel.aggregate([

                {
                    $lookup: {
                        from: "publishers",
                        localField: "pid",
                        foreignField: "pid",
                        as: "publisher_details"
                    }
                },
                // { $match: { writer_uid: { $ne: writer_uid } } },
                // { $unwind: { path: "$publisher_details", preserveNullAndEmptyArrays: true } }
            ]);
        } catch (error) {
            console.error("Error fetching assigned publishers:", error);
            throw new Error("Failed to fetch assigned publishers");
        }
    }

    /**
     * Get all writer requests for a given publisher (by pid).
     * Joins with User collection on writer_uid = uid.
     * Also joins with WriterStats on writer_uid.
     * Also calculates stories_count from contents.
     */
    async getWriterRequestsForPublisher(pid) {
        try {
            return await this.assignedPublishersModel.aggregate([
                { $match: { pid: pid } },
                {
                    $lookup: {
                        from: "users",
                        localField: "writer_uid",
                        foreignField: "uid",
                        as: "writer_details"
                    }
                },
                { $unwind: { path: "$writer_details", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "writerstats",
                        localField: "writer_uid",
                        foreignField: "writer_uid",
                        as: "writer_stats"
                    }
                },
                { $unwind: { path: "$writer_stats", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "contents",
                        localField: "writer_uid",
                        foreignField: "uid",
                        as: "writer_contents"
                    }
                },
                {
                    $addFields: {
                        "writer_details.stories_count": { $size: { $ifNull: ["$writer_contents", []] } },
                        "writer_details.followers_count": { $ifNull: ["$writer_stats.followers_count", 0] },
                        "writer_details.average_rating": { $ifNull: ["$writer_stats.average_rating", 0] },
                        "writer_details.bio": { $ifNull: ["$writer_stats.bio", ""] },
                        "writer_details.genre_specialization": { $ifNull: ["$writer_stats.genre_specialization", []] },
                        "writer_details.activity_status": { $ifNull: ["$writer_stats.activity_status", "active"] }
                    }
                },
                {
                    $project: {
                        writer_contents: 0  // Don't return all content docs, just the count
                    }
                }
            ]);
        } catch (error) {
            console.error("Error fetching writer requests for publisher:", error);
            throw new Error("Failed to fetch writer requests");
        }
    }

    async findAssignedPublisher(query) {
        return await this.assignedPublishersModel.findOne(query).lean();
    }

    async insertAssignedPublisher(data) {
        try {
            return await this.assignedPublishersModel.create(data);
        } catch (error) {
            console.error("Error inserting assigned publisher request:", error);
            throw new Error("Failed to insert assigned publisher request");
        }
    }

    async updateAssignedPublisher(filter, update_field) {
        try {
            return await this.assignedPublishersModel.updateOne(filter, { $set: update_field });
        } catch (error) {
            console.error("Error updating assigned publisher request:", error);
            throw new Error("Failed to update assigned publisher request");
        }
    }

    async deletePublisher(data) {
        return await this.publishermodel.deleteOne(data).lean()
    }
    async insertPublisher(publisherData) {
        try {
            return await this.publishermodel.insertOne(publisherData);
        } catch (error) {
            console.error("Error inserting publisher:", error);
            throw new Error("Failed to insert publisher");
        }
    }
    async updatePublisher(publisherData, uid) {
        try {
            return await this.publishermodel.updateOne({ uid: uid }, { $set: publisherData });
        } catch (error) {
            console.error("Error updating publisher:", error);
            throw new Error("Failed to update publisher");
        }
    }
}


module.exports = PublishersFunctions;