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

class PublisherController {
    constructor(module) {
        console.log("Publisher controller is active now==========>");
        this.userFunc = module.usersFunctions;
        this.contentFunc = module.contentFunctions;
        this.voteFunc = module.voteFunctions;
        this.eventFunc = module.eventFunctions;
        this.publisherFunc = module.publisherFunctions;
    }


    async publisherlists(req, res, token_data) {
        try {
            const uid = req.params.uid;
            if (!uid) {
                return res.status(400).json({ status: 400, message: "Missing uid parameter", data: {} });
            }
            
            const assignedPublishers = await this.publisherFunc.getAssignedPublishers(uid);

            // Format the output: list of publishers with the writer UID attached
            const formattedData = assignedPublishers.map(ap => {
                if (ap.publisher_details) {
                     return {
                         ...ap.publisher_details,
                         writer_uid: ap.writer_uid,
                         assignment_status: ap.status,
                         requested_by: ap.requested_by,
                         assignment_id: ap._id
                     };
                }
                return ap;
            }).filter(item => item.uid); // Keep only valid publishers

            return res
                .status(200)
                .json({
                    status: 200, 
                    message: "Lists of assigned publishers fetched successfully", 
                    data: formattedData
                });
        } catch (error) {
            console.error("Error during publisherlists fetch:", error);
            res
                .status(500)
                .json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    async addpublisher(req, res, token_data) {
        try {
            const targetUid = req.params.uid;
            const requesterUid = token_data.uid;
            const requestedBy = req.body.requested_by; // Should be "Publisher" or "Writer"

            if (!targetUid || !requesterUid || !requestedBy) {
                return res.status(400).json({ status: 400, message: "Missing target UID or requested_by in body", data: {} });
            }

            if (!["Publisher", "Writer"].includes(requestedBy)) {
                return res.status(400).json({ status: 400, message: "requested_by must be 'Publisher' or 'Writer'", data: {} });
            }

            let publisher_uid, writer_uid;

            if (requestedBy === "Publisher") {
                publisher_uid = requesterUid;
                writer_uid = targetUid;
            } else {
                publisher_uid = targetUid;
                writer_uid = requesterUid;
            }

            // Check if request already exists
            const existingRequest = await this.publisherFunc.findAssignedPublisher({ publisher_uid, writer_uid });
            if (existingRequest) {
                return res.status(409).json({ status: 409, message: "Request already exists between this publisher and writer", data: {} });
            }

            const requestData = {
                publisher_uid,
                writer_uid,
                requested_by: requestedBy,
                status: "Pending"
            };

            await this.publisherFunc.insertAssignedPublisher(requestData);

            return res
                .status(201)
                .json({
                    status: 201, message: "Request sent successfully", data: {}
                });
        } catch (error) {
            console.error("Error during addpublisher:", error);
            res
                .status(500)
                .json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    async updatepublisher(req, res, token_data) {
        try {
            const targetUid = req.params.uid;
            const requesterUid = token_data.uid;
            
            // Accept either `role` or `requested_by` indicating who is initiating the removal
            const role = req.body.role || req.body.requested_by; 

            if (!targetUid || !requesterUid || !role) {
                return res.status(400).json({ status: 400, message: "Missing target UID or role in body", data: {} });
            }

            if (!["Publisher", "Writer"].includes(role)) {
                return res.status(400).json({ status: 400, message: "role must be 'Publisher' or 'Writer'", data: {} });
            }

            let publisher_uid, writer_uid;
            if (role === "Publisher") {
                publisher_uid = requesterUid;
                writer_uid = targetUid;
            } else {
                publisher_uid = targetUid;
                writer_uid = requesterUid;
            }

            const deleteResult = await this.publisherFunc.deleteAssignedPublisher({ publisher_uid, writer_uid });
            if (deleteResult.deletedCount === 0) {
                return res.status(404).json({ status: 404, message: "Assignment not found", data: {} });
            }

            return res
                .status(200)
                .json({
                    status: 200, message: "Successfully removed", data: {}
                });
        } catch (error) {
            console.error("Error during updatepublisher/remove:", error);
            res
                .status(500)
                .json({ status: 500, message: "Internal server error", data: {} });
        }
    }
    async deletepublisher(req, res) {
        try {

            return res
                .status(201)
                .json({
                    status: 201, message: "Contents list fetched", data: {

                    }
                });
        } catch (error) {
            console.error("Error during signup:", error);
            res
                .status(500)
                .json({ status: 500, message: "Internal server error", data: {} });
        }
    }
}

module.exports = PublisherController;
