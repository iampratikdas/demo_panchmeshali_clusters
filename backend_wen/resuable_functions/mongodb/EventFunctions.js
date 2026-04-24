//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Import Default
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const moment = require("moment");
const Eventschema = require("../../models/monogdb/EventLists");
const Contentschema = require("../../models/monogdb/Contents");
const EventRequestschema = require("../../models/monogdb/EventRequests");
const Setup = require("../../db/mongodb/setupDatabase");

class EventFunctions {
    constructor() {
        (async () => {
            this.eventmodel = await Eventschema(await Setup.getConnection());
            this.contentmodel = await Contentschema(await Setup.getConnection());
            this.eventRequestModel = await EventRequestschema(await Setup.getConnection());
        })()
    }

    async findOneEvent(data) {
        return await this.eventmodel.findOne(data).lean()
    }
    async findAllEvents(data= {}){
        return await this.eventmodel.find(data).sort({ createdAt: -1 }).lean()
    }
    async eventCount(data) {
        return await this.eventmodel.find(data).countDocuments().lean()
    }
    async eventListByData(data, skip = 0, limit = 0) {
        return await this.eventmodel.find(data).skip(skip).limit(limit).sort({ createdAt: -1 }).lean()
    }
     async deleteEvent(data) {
        return await this.eventmodel.deleteOne(data).lean()
    }
    async insertEvent(eventData) {
       try {
            return await this.eventmodel.insertOne(eventData);
        } catch (error) {
            console.error("Error inserting event:", error);
            throw new Error("Failed to insert event");
        }
    }
     async updateEvent(eventData, uid) {
        try {
            return await this.eventmodel.updateOne({ uid: uid },{ $set: eventData });
        } catch (error) {
            console.error("Error updating event:", error);
            throw new Error("Failed to update event");
        }
    }

    // Event Request Hooks
    async insertEventRequest(data) {
        try {
            return await this.eventRequestModel.create(data);
        } catch (error) {
            console.error("Error inserting event request:", error);
            throw new Error("Failed to insert event request");
        }
    }

    async findOneEventRequest(query) {
        return await this.eventRequestModel.findOne(query).lean();
    }

    async updateEventRequest(query, updateData) {
        try {
            return await this.eventRequestModel.updateOne(query, { $set: updateData });
        } catch (error) {
            console.error("Error updating event request:", error);
            throw new Error("Failed to update event request");
        }
    }
}

module.exports = EventFunctions;