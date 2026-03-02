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

class EventController {
  
  constructor(module) {
    console.log("Events controller is active now==========>");
    this.userFunc = module.usersFunctions;
    this.contentFunc = module.contentFunctions;
    this.voteFunc = module.voteFunctions;
    this.eventFunc =  module.eventFunctions;
  }
  
 async eventLists(req, res, token_data) {
  try {
    // fetch all events from DB
    const events = await this.eventFunc.findAllEvents(); 

    // Build map: parentEid -> childEvents[]
    const childMap = {};
    events.forEach(ev => {
      const parentKey = ev.parent || ''; // blank string for no parent
      if (!childMap[parentKey]) {
        childMap[parentKey] = [];
      }
      childMap[parentKey].push(ev);
    });

    // Recursive function to attach children to an event
    function attachChildren(event) {
      const children = childMap[event.eid] || [];
      return {
        ...event,
        siblings: children.map(child => attachChildren(child)) // recurse
      };
    }

    // Start from root (events with no parent)
    const rootEvents = childMap[''] || [];

    const finalList = rootEvents.map(parentEvent => attachChildren(parentEvent));

    return res.status(200).json({
      message: "Event list fetched successfully",
      data: finalList
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
}

async eventListsUsers(req, res){
    try {
      const events = await this.eventFunc.findAllEvents(); 
      return res.status(200).json({
            message: "Event list fetched successfully",
            data: events
          });
    }catch(err){
       console.error(err);
      res.status(500).send('Error processing the data.');
    }
}



  //Create Events
  async createEvents(req, res, token_data) {
  try {
    const {
      eid,
      name,
      description,
      active,
      created_by,
      team,
      st_dt,
      en_dt,
      sh_list,
      w_count,
      categories,
      type
    } = req.body;

    // Check if parent param present
    const parentId = req.query.parent || null;

    // If parent param exists, verify if event exists
    let parentEvent = null;
    if (parentId) {
      parentEvent = await this.eventFunc.findOneEvent({ eid: parentId });
      if (!parentEvent) {
        return res.status(404).json({
          message: "Parent event not found",
        });
      }
    }
    const data = {
      eid,
      name,
      description,
      active,
      created_by: created_by || token_data?.uid, // if you want to use token_data
      team,
      st_dt: st_dt || moment().unix(),
      en_dt: en_dt || moment().unix(),
      sh_list, // number of short listing candidates on that events
      w_count,
      type: type || "vote",
      categories,
      parent: parentEvent ? parentEvent.eid : "", // if parent exist set else empty
      createdAt: moment().unix(),
      updatedAt: moment().unix(),
    }
    await this.eventFunc.insertEvent(data)

    return res.status(201).json({
      message: "Event created successfully",
      data,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
}



// UPDATE EVENT
async updatedEvents(req, res, token_data) {
  try {
    const eid = req.query.eid; 
    if (!eid) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    // find if event exists
    const eventExist = await this.eventFunc.findOneEvent({ eid });
    if (!eventExist) {
      return res.status(404).json({ message: "Event not found" });
    }

    // prepare updated data
    const {
      name,
      description,
      active,
      team,
      st_dt,
      en_dt,
      sh_list,
      w_count,
      categories,
      // parent,
    } = req.body;

    const updatedData = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(active !== undefined && { active }),
      ...(team !== undefined && { team }),
      ...(st_dt !== undefined && { st_dt }),
      ...(en_dt !== undefined && { en_dt }),
      ...(sh_list !== undefined && { sh_list }),
      ...(w_count !== undefined && { w_count }),
      ...(categories !== undefined && { categories }),
      // ...(parent !== undefined && { parent }),
      updatedAt: moment().unix(),
    };

    // update event
    const updatedEvent = await this.eventFunc.updateEvent({ eid }, updatedData);

    return res.status(200).json({
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

// DELETE EVENT
async deletEvents(req, res, token_data) {
  try {
    const eid = req.query.eid ; // event id
    if (!eid) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    // find event first
    const eventExist = await this.eventFunc.findOneEvent({ eid });
    if (!eventExist) {
      return res.status(404).json({ message: "Event not found" });
    }

    // delete event (hard delete)
    await this.eventFunc.deleteEvent({ eid });

    return res.status(200).json({
      message: "Event deleted successfully",
      eid,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
}


}

module.exports = EventController;