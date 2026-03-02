//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Import Default
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const moment = require("moment");
const Eventschema = require("../../models/monogdb/EventLists");
const Contentschema = require("../../models/monogdb/Contents");
const Setup = require("../../db/mongodb/setupDatabase");
class EventFunctions {
    constructor() {
        (async () => {
            this.eventmodel = await Eventschema(await Setup.getConnection());
            this.contentmodel = await Contentschema(await Setup.getConnection());
        })()
    }

    async findOneEvent(data) {
        return await this.eventmodel.findOne(data).lean()
    }
    async findAllEvents(data= {}){
        return await this.eventmodel.find(data).sort({ createdAt: -1 }).lean()
    }
     async deleteEvent(data) {
        return await this.eventmodel.deleteOne(data).lean()
    }
    async insertEvent(eventData) {
       try {
            // console.log("user========================================>", userData)
            return await this.eventmodel.insertOne(eventData);
        } catch (error) {
            console.error("Error inserting user:", error);
            throw new Error("Failed to insert user");
        }
    }
     async updateEvent(eventData, uid) {
        try {
            // console.log("user========================================>", userData)
            return await this.eventmodel.updateOne({ uid: uid },{ $set: eventData });
        } catch (error) {
            console.error("Error inserting user:", error);
            throw new Error("Failed to insert user");
        }
    }
}


module.exports = EventFunctions;