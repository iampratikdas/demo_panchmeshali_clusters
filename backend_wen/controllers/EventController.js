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
    this.eventFunc = module.eventFunctions;
    this.publisherFunc = module.publisherFunctions;
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

  async eventListsUsers(req, res, token_data) {
    try {
      const events = await this.eventFunc.findAllEventRequest({ writer_uid: token_data?.uid, status: "Accepted" });
      const detail_events = await this.eventFunc.findDetailEvents(events)
      return res.status(200).json({
        message: "Event list fetched successfully",
        data: detail_events
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error processing the data.');
    }
  }



  //Create Events
  async createEvents(req, res, token_data) {
    try {
      const {
        active,
        categories,
        description,
        eid,
        en_dt,
        competition,
        default_folder,
        episode_wise,
        event_type,
        is_app,
        is_book,
        is_social_media,
        logo_url,
        parent,
        name,
        paid,
        paid_amt,
        sh_list,
        st_dt,
        team,
        w_count
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

      // Find the publisher this user belongs to, to set the event's pid
      let publisher_pid = "";
      if (this.publisherFunc) {
        const publishers = await this.publisherFunc.findOnePublisher({ uids: { $in: [token_data.uid] } });
        if (publishers && publishers.length > 0) {
          publisher_pid = publishers[0].pid;
        }
      }

      const data = {
        eid,
        name,
        description,
        active,
        created_by: token_data?.uid, // if you want to use token_data
        pid: publisher_pid, // adding pid to the event
        team,
        paid,
        competition,
        default_folder,
        episode_wise,
        is_app,
        is_book,
        is_social_media,
        logo_url,
        paid_amt,
        st_dt: st_dt || moment().unix(),
        en_dt: en_dt || moment().unix(),
        sh_list, // number of short listing candidates on that events
        w_count,
        type: event_type || "vote",
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
        active,
        categories,
        description,
        en_dt,
        competition,
        default_folder,
        episode_wise,
        event_type,
        is_app,
        is_book,
        is_social_media,
        logo_url,
        parent,
        name,
        paid,
        paid_amt,
        sh_list,
        st_dt,
        team,
        w_count
        // parent,
      } = req.body;

      // Find the publisher this user belongs to, to update the event's pid if needed
      let publisher_pid = "";
      if (this.publisherFunc) {
        const publishers = await this.publisherFunc.findOnePublisher({ uids: token_data.uid });
        if (publishers && publishers.length > 0) {
          publisher_pid = publishers[0].pid;
        }
      }

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
        ...(competition !== undefined && { competition }),
        ...(default_folder !== undefined && { default_folder }),
        ...(episode_wise !== undefined && { episode_wise }),
        ...(event_type !== undefined && { event_type }),
        ...(is_app !== undefined && { is_app }),
        ...(is_book !== undefined && { is_book }),
        ...(is_social_media !== undefined && { is_social_media }),
        ...(logo_url !== undefined && { logo_url }),
        ...(parent !== undefined && { parent }),
        ...(paid !== undefined && { paid }),
        ...(paid_amt !== undefined && { paid_amt }),
        ...(publisher_pid !== "" && { pid: publisher_pid }),
        // ...(parent !== undefined && { parent }),
        updatedAt: moment().unix(),
      };
      console.log("updatedData================>", updatedData, eid)
      // update event
      const updatedEvent = await this.eventFunc.updateEvent(eid, updatedData);
      console.log("updatedEvent================>", updatedEvent)

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
      const eid = req.query.eid; // event id
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

  async requestForEvent(req, res, token_data) {
    try {
      const { eid } = req.body;
      const writer_uid = token_data.uid;

      if (!eid) {
        return res.status(400).json({ status: 400, message: "Event ID (eid) is required", data: {} });
      }

      // Verify event exists to derive Publisher ID (pid)
      const eventExist = await this.eventFunc.findOneEvent({ eid });
      if (!eventExist) {
        return res.status(404).json({ status: 404, message: "Event not found", data: {} });
      }

      // The publisher ID (pid) is bound to the user who created the event
      const pid = eventExist.created_by;
      if (!pid) {
        return res.status(400).json({ status: 400, message: "Event does not have a tied publisher", data: {} });
      }

      // Verify no existing request exists
      const existingRequest = await this.eventFunc.findOneEventRequest({ eid, writer_uid });
      if (existingRequest) {
        return res.status(409).json({ status: 409, message: "You have already applied for this event", data: {} });
      }

      const requestData = {
        eid,
        writer_uid,
        pid,
        status: "Pending" // Initial phase
      };

      await this.eventFunc.insertEventRequest(requestData);

      return res.status(201).json({
        status: 201, message: "Successfully requested to participate in event", data: requestData
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: 500, message: "Internal Server Error", data: {} });
    }
  }

  async updateEventRequestStatus(req, res, token_data) {
    try {
      // Publisher accepts or rejects the pending event application
      const { request_id, status } = req.body;
      const publisher_uid = token_data.uid;

      if (!request_id || !status) {
        return res.status(400).json({ status: 400, message: "request_id and status are required", data: {} });
      }

      if (!["Accepted", "Rejected"].includes(status)) {
        return res.status(400).json({ status: 400, message: "Status must be Accepted or Rejected", data: {} });
      }

      // Verify request exists
      const existingRequest = await this.eventFunc.findOneEventRequest({ _id: request_id });
      if (!existingRequest) {
        return res.status(404).json({ status: 404, message: "Event participation request not found", data: {} });
      }

      // Validate that the request actually belongs to this Publisher's domain (unless Admin is processing)
      if (token_data.role !== "admin" && token_data.role !== "manager") {
        if (existingRequest.created_by !== publisher_uid) {
          return res.status(403).json({ status: 403, message: "Unauthorized. You do not own this event.", data: {} });
        }
      }

      if (existingRequest.status !== "Pending") {
        return res.status(409).json({ status: 409, message: `Request is already ${existingRequest.status}`, data: {} });
      }

      // Process update
      await this.eventFunc.updateEventRequest({ _id: request_id }, { status });

      return res.status(200).json({
        status: 200, message: `Event participation request ${status} successfully`, data: {}
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: 500, message: "Internal Server Error", data: {} });
    }
  }

  // ── Active Events for Writers ───────────────────────────────────────────────

  /**
   * GET /active_events
   * Returns all active events enriched with publisher (creator) name.
   * Accessible by: writer, both
   */
  async getActiveEvents(req, res, token_data) {
    try {
      const writer_uid = token_data.uid;

      // Fetch all active events (no parent — root level only, or include all)
      const events = await this.eventFunc.findAllEvents({ active: true });

      // Enrich each event with publisher name and whether writer already joined
      const enriched = await Promise.all(
        events.map(async (ev) => {
          // Publisher name lookup
          // let publisher_name = "Unknown Publisher";
          const team_member = await this.publisherFunc.findAssignedPublisher({ writer_uid: writer_uid, status: "Accepted" });
          const publisher_name = await this.publisherFunc.findOnePublisher({ pid: ev.pid });
          // Check if writer is already a team member of this event
          const already_joined = await this.eventFunc.isTeamMember(ev.eid, writer_uid);
          // console.log("already publisshet=============>", already_joined)
          // if (!already_joined) {
          // }
          return {
            ...ev,
            publisher_name: publisher_name?.name,
            team_member: team_member?.status === "Accepted" ? true : false,
            already_joined
          };

        })
      );

      return res.status(200).json({
        status: 200,
        message: "Active events fetched successfully",
        data: enriched,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: 500, message: "Internal Server Error", data: {} });
    }
  }

  /**
   * POST /join_event
   * Writer joins a non-paid active event.
   * Validates: publisher membership, event is non-paid, no duplicate join.
   * Body: { eid, pid }
   */
  async joinEvent(req, res, token_data) {
    try {
      const { eid, pid } = req.body;
      const writer_uid = token_data.uid;

      if (!eid || !pid) {
        return res.status(400).json({ status: 400, message: "eid and pid are required", data: {} });
      }

      // Verify event exists and is active
      const event = await this.eventFunc.findOneEvent({ eid, active: true });
      if (!event) {
        return res.status(404).json({ status: 404, message: "Active event not found", data: {} });
      }

      // Block paid events — preserve existing paid flow
      if (event.paid) {
        return res.status(400).json({
          status: 400,
          message: "This is a paid event. Please contact the publisher for payment details.",
          data: {},
        });
      }

      // Check writer is a member of the publisher (Accepted status)
      const membership = this.publisherFunc
        ? await this.publisherFunc.findAssignedPublisher({ pid, writer_uid, status: "Accepted" })
        : null;
      console.log("membership===============>", membership, { pid, writer_uid, status: "Accepted" })
      if (!membership) {
        return res.status(403).json({
          status: 403,
          message: "You must be an accepted member of this publisher before joining their event.",
          data: {},
        });
      }

      // Check duplicate — already in team
      const alreadyJoined = await this.eventFunc.isTeamMember(eid, writer_uid);
      if (alreadyJoined) {
        return res.status(409).json({ status: 409, message: "You have already joined this event", data: {} });
      }

      // Add writer to event team
      let resp = await this.eventFunc.addTeamMember({ eid, writer_uid, pid });
      console.log("res=======================>", resp)
      return res.status(200).json({
        status: 200,
        message: "Successfully joined the event",
        data: { eid, writer_uid },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: 500, message: "Internal Server Error", data: {} });
    }
  }
}

module.exports = EventController;