//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Import Default
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const moment = require("moment");
const Publisherschema = require("../../models/monogdb/Publishers");
const Contentschema = require("../../models/monogdb/Contents");
const Setup = require("../../db/mongodb/setupDatabase");
class PublishersFunctions {
    constructor() {
        (async () => {
            this.publishermodel = await Publisherschema(await Setup.getConnection());
            this.contentmodel = await Contentschema(await Setup.getConnection());
        })()
    }

    async findOnePublisher(data) {
        return await this.publishermodel.findOne(data).lean()
    }
    async findAllPublishers(data = {}) {
        return await this.publishermodel.find(data).sort({ createdAt: -1 }).lean()
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