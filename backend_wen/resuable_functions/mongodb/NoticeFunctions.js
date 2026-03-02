//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Import Default
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const moment = require("moment");
const Eventschema = require("../../models/monogdb/NoticesAdmin");
const Contentschema = require("../../models/monogdb/Contents");
const Setup = require("../../db/mongodb/setupDatabase");
class NoticeFunctions {
    constructor() {
        (async () => {
            this.eventmodel = await Eventschema(await Setup.getConnection());        })()
    }

    async findOneEvent(data) {
        return await this.eventmodel.findOne(data).lean()
    }
    async findAllNotice(data= {}){
        return await this.eventmodel.find(data).sort({ _id: -1 }).lean()
    }
     async deleteEvent(data) {
        return await this.eventmodel.deleteOne(data).lean()
    }
    async insertNotice(eventData) {
       try {
            // console.log("user========================================>", userData)
            return await this.eventmodel.insertOne(eventData);
        } catch (error) {
            console.error("Error inserting user:", error);
            throw new Error("Failed to insert user");
        }
    }
     async updateNotice(eventData, uid) {
        try {
            // console.log("user========================================>", userData)
            return await this.eventmodel.updateOne({ uid: uid },{ $set: eventData });
        } catch (error) {
            console.error("Error inserting user:", error);
            throw new Error("Failed to insert user");
        }
    }
}


module.exports = NoticeFunctions;