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
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    async getAllCompanies(req, res, user_data) {
        try {
            if (user_data.role !== "admin") {
                return res.status(403).json({ status: 403, message: "Access denied. Admins only.", data: {} });
            }
            const companies = await this.publisherFunc.findAllPublishers();
            return res.status(200).json({ status: 200, message: "Publisher companies fetched successfully", data: companies });
        } catch (error) {
            console.error("Error during getAllCompanies:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    async createCompany(req, res, user_data) {
        try {

            const body = req.body;
            // Target UID maps to the user token initiator 
            const uid = body.uids;

            if (!body.name) {
                return res.status(400).json({ status: 400, message: "Company name is required", data: {} });
            }
            if (user_data.role != "admin") {
                return res.status(400).json({ status: 400, message: "You are not admin", data: {} });
            }
            if (!body.email) {
                return res.status(400).json({ status: 400, message: "Company email is required", data: {} });
            }
            if (!body.phone) {
                return res.status(400).json({ status: 400, message: "Company phone is required", data: {} });
            }

            const existingCompany = await this.publisherFunc.findOnePublisher({ email: body.email });
            if (existingCompany) {
                return res.status(409).json({ status: 409, message: "Publisher company already exists for this user", data: {} });
            }

            const companyData = {
                pid: gen(10),
                uids: uid,
                name: body.name,
                description: body.description || "",
                email: body.email,
                phone: body.phone,
                logo_url: body.logo_url || "",
                rgst_gov_id: body.rgst_gov_id || "",
                status: "Active" // Starts at Pending, Admin approves later or Active if preferred
            };
            console.log("checking==========>", companyData)
            await this.publisherFunc.insertPublisher(companyData);

            return res.status(201).json({
                status: 201, message: "Publisher company created successfully", data: companyData
            });

        } catch (error) {
            console.error("Error creating publisher company:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    async addpublisher(req, res, token_data) {
        try {
            const targetUid = req.params.uid;
            const requesterUid = token_data.uid;
            const requestedBy = token_data.role; // Should be "Publisher" or "Writer"

            if (!targetUid || !requesterUid || !requestedBy) {
                return res.status(400).json({ status: 400, message: "Missing target UID or requested_by in body", data: {} });
            }

            if (!["publisher", "writer", 'both'].includes(requestedBy)) {
                return res.status(400).json({ status: 400, message: "requested_by must be 'Publisher' or 'Writer'", data: {} });
            }

            let publisher_uid, writer_uid;

            if (requestedBy === "publisher") {
                publisher_uid = requesterUid;
                writer_uid = targetUid;
            } else {
                publisher_uid = targetUid;
                writer_uid = requesterUid;
            }
            // We verify that the target user's role is different from the requester's role
            const targetUser = await this.userFunc.findOneUserByUid(targetUid);
            if (!targetUser) {
                return res.status(404).json({ status: 404, message: "Target user not found", data: {} });
            }
            if (token_data.role === targetUser.role) {
                return res.status(409).json({ status: 409, message: `Cannot create assigned relationship! Both users are ${token_data.role}`, data: {} });
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
            const request_type = req.body.request_type

            // Accept either `role` or `requested_by` indicating who is initiating the removal
            const role = token_data.role;

            if (!targetUid || !requesterUid || !role) {
                return res.status(400).json({ status: 400, message: "Missing target UID or role in body", data: {} });
            }

            if (!["publisher", "writer"].includes(role)) {
                return res.status(400).json({ status: 400, message: "role must be 'Publisher' or 'Writer'", data: {} });
            }

            let publisher_uid, writer_uid;
            if (role === "publisher") {
                publisher_uid = requesterUid;
                writer_uid = targetUid;
            } else {
                publisher_uid = targetUid;
                writer_uid = requesterUid;
            }
            const existingRequest = await this.publisherFunc.findAssignedPublisher({ publisher_uid, writer_uid });
            if (existingRequest) {
                return res.status(409).json({ status: 409, message: "Request already exists between this publisher and writer", data: {} });
            }
            const deleteResult = await this.publisherFunc.updateAssignedPublisher({ publisher_uid, writer_uid }, { status: request_type });
            // if (deleteResult.deletedCount === 0) {
            //     return res.status(404).json({ status: 404, message: "Assignment not found", data: {} });
            // }
            console.log("deleteResult=============>", deleteResult)
            return res
                .status(200)
                .json({
                    status: 200, message: `Successfully ${request_type}`, data: {}
                });
        } catch (error) {
            console.error("Error during updatepublisher/remove:", error);
            res
                .status(500)
                .json({ status: 500, message: "Internal server error", data: {} });
        }
    }
    // async deletepublisher(req, res) {
    //     try {

    //         return res
    //             .status(201)
    //             .json({
    //                 status: 201, message: "Contents list fetched", data: {

    //                 }
    //             });
    //     } catch (error) {
    //         console.error("Error during signup:", error);
    //         res
    //             .status(500)
    //             .json({ status: 500, message: "Internal server error", data: {} });
    //     }
    // }
}

module.exports = PublisherController;
