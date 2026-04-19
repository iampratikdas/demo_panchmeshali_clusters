//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Import Default
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const moment = require("moment");
const Publisherschema = require("../../models/monogdb/Publishers");
const Contentschema = require("../../models/monogdb/Contents");
const WritersAssignedPublishersschema = require("../../models/monogdb/WritersAssignedPublishers");
const Setup = require("../../db/mongodb/setupDatabase");
class PublishersFunctions {
    constructor() {
        (async () => {
            this.publishermodel = await Publisherschema(await Setup.getConnection());
            this.contentmodel = await Contentschema(await Setup.getConnection());
            this.assignedPublishersModel = await WritersAssignedPublishersschema(await Setup.getConnection());
        })()
    }

    async findOnePublisher(data) {
        return await this.publishermodel.findOne(data).lean()
    }
    async findAllPublishers(data = {}) {
        return await this.publishermodel.find(data).sort({ createdAt: -1 }).lean()
    }
    async getAssignedPublishers(writer_uid) {
        try {
            return await this.assignedPublishersModel.aggregate([
                { $match: { writer_uid: writer_uid } },
                {
                    $lookup: {
                        from: "publishers", // Mongoose pluralizes Publishers model name
                        localField: "publisher_uid",
                        foreignField: "uid",
                        as: "publisher_details"
                    }
                },
                { $unwind: { path: "$publisher_details", preserveNullAndEmptyArrays: true } }
            ]);
        } catch (error) {
            console.error("Error fetching assigned publishers:", error);
            throw new Error("Failed to fetch assigned publishers");
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

    async updateAssignedPublisher(filter, update_feild) {
        try {
            return await this.assignedPublishersModel.updateOne(filter, update_feild);
        } catch (error) {
            console.error("Error deleting assigned publisher request:", error);
            throw new Error("Failed to delete assigned publisher request");
        }
    }

    async deletePublisher(data) {
        return await this.publishermodel.deleteOne(data).lean()
    }
    async insertPublisher(publisherData) {
        try {
            // console.log("user========================================>", userData)
            return await this.publishermodel.insertOne(publisherData);
        } catch (error) {
            console.error("Error inserting user:", error);
            throw new Error("Failed to insert user");
        }
    }
    async updatePublisher(publisherData, uid) {
        try {
            // console.log("user========================================>", userData)
            return await this.publishermodel.updateOne({ uid: uid }, { $set: publisherData });
        } catch (error) {
            console.error("Error inserting user:", error);
            throw new Error("Failed to insert user");
        }
    }
}


module.exports = PublishersFunctions;