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
        console.log("Publisher controller is active now==========>")
        this.userFunc = module.usersFunctions;
        this.contentFunc = module.contentFunctions;
        this.voteFunc = module.voteFunctions;
        this.eventFunc = module.eventFunctions;
        this.publisherFunc = module.publisherFunctions;
        this.writerStatsFunc = module.writerStatsFunctions;
    }


    /**
     * GET /publisher_lists/:uid
     * Writer fetches list of publishers they are assigned to.
     */
    async publisherlists(req, res, token_data) {
        try {
            const uid = req.params.uid;
            if (!uid) {
                return res.status(400).json({ status: 400, message: "Missing uid parameter", data: {} });
            }

            const assignedPublishers = await this.publisherFunc.getAssignedPublishers(uid);
            // console.log("assignedPublishers============>", uid, assignedPublishers);
            // Format the output: list of publishers with assignment info

            // console.log("assignedPublishers=============>", assignedPublishers)
            return res
                .status(200)
                .json({
                    status: 200,
                    message: "Lists of assigned publishers fetched successfully",
                    data: assignedPublishers
                });
        } catch (error) {
            console.error("Error during publisherlists fetch:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    /**
     * GET /publisher_companies
     * Admin fetches all publisher companies.
     */
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

    /**
     * POST /create_publisher_company
     * Admin creates a new publisher company.
     */
    async createCompany(req, res, user_data) {
        try {

            const body = req.body;
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
                status: "Active"
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

    /**
     * POST /request_publisher_users/:uid
     * Send a join request between publisher and writer.
     */
    async addpublisher(req, res, token_data) {
        try {
            const targetUid = req.params.uid;
            const requesterUid = token_data.uid;
            const requestedBy = token_data.role;

            if (!targetUid || !requesterUid || !requestedBy) {
                return res.status(400).json({ status: 400, message: "Missing target UID or requested_by in body", data: {} });
            }

            if (!["publisher", "writer", 'both'].includes(requestedBy)) {
                return res.status(400).json({ status: 400, message: "requested_by must be 'publisher' or 'writer'", data: {} });
            }

            let pid, writer_uid;

            if (requestedBy === "publisher") {
                // Publisher is inviting a writer — find the publisher's company pid
                const publisherCompany = await this.publisherFunc.findOnePublisher({ uids: requesterUid });
                if (!publisherCompany) {
                    return res.status(404).json({ status: 404, message: "Publisher company not found for this user", data: {} });
                }
                pid = publisherCompany.pid;
                writer_uid = targetUid;
            } else {
                // Writer is requesting to join a publisher's company (by pid)
                pid = targetUid;
                writer_uid = requesterUid;
                // Verify publisher company exists
                const publisherCompany = await this.publisherFunc.findOnePublisher({ pid: pid });
                if (!publisherCompany) {
                    return res.status(404).json({ status: 404, message: "Publisher company not found", data: {} });
                }
            }

            // Verify target user exists
            const targetUser = await this.userFunc.findOneUserByUid(targetUid);
            if (!targetUser && requestedBy === "publisher") {
                return res.status(404).json({ status: 404, message: "Target writer not found", data: {} });
            }

            // Check if request already exists
            const existingRequest = await this.publisherFunc.findAssignedPublisher({ pid, writer_uid, status: { $in: ['Active', 'Pending'] } });
            if (existingRequest) {
                return res.status(409).json({ status: 409, message: "Request already exists between this publisher and writer", data: {} });
            }

            const requestData = {
                pid,
                writer_uid,
                requested_by: requestedBy === 'both' ? 'publisher' : requestedBy,
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

    /**
     * POST /update_publisher_users/:uid  (legacy — kept for backward compat)
     * Writer removes themselves from a publisher (Cancelled).
     */
    async updatepublisher(req, res, token_data) {
        try {
            const targetUid = req.params.uid; // pid (publisher company id) if writer; writer_uid if publisher
            const requesterUid = token_data.uid;
            const request_type = req.body.request_type;
            const role = token_data.role;

            if (!targetUid || !requesterUid || !role) {
                return res.status(400).json({ status: 400, message: "Missing target UID or role in body", data: {} });
            }

            let pid, writer_uid;
            if (role === "publisher") {
                const publisherCompany = await this.publisherFunc.findOnePublisher({ uids: requesterUid });
                if (!publisherCompany) {
                    return res.status(404).json({ status: 404, message: "Publisher company not found", data: {} });
                }
                pid = publisherCompany.pid;
                writer_uid = targetUid;
            } else {
                pid = targetUid;
                writer_uid = requesterUid;
            }

            const existingRequest = await this.publisherFunc.findAssignedPublisher({ pid, writer_uid });
            if (!existingRequest) {
                return res.status(404).json({ status: 404, message: "Assignment not found between this publisher and writer", data: {} });
            }

            await this.publisherFunc.updateAssignedPublisher({ pid, writer_uid }, { status: request_type });

            return res
                .status(200)
                .json({
                    status: 200, message: `Successfully ${request_type}`, data: {}
                });
        } catch (error) {
            console.error("Error during updatepublisher:", error);
            res
                .status(500)
                .json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    /**
     * GET /team_requests/:pid
     * Publisher fetches all writer requests/members for their company.
     */
    async getTeamRequests(req, res, token_data) {
        try {
            const role = token_data.role;
            if (!["publisher", "both"].includes(role)) {
                return res.status(403).json({ status: 403, message: "Access denied. Publishers only.", data: {} });
            }

            // Get the publisher company for this user
            const publisherCompany = await this.publisherFunc.findOnePublisher({ uids: token_data.uid });
            if (!publisherCompany) {
                return res.status(404).json({ status: 404, message: "No publisher company found for this user", data: {} });
            }

            const pid = publisherCompany.pid;
            const requests = await this.publisherFunc.getWriterRequestsForPublisher(pid);

            const formattedData = requests.map(r => ({
                assignment_id: r._id,
                pid: r.pid,
                writer_uid: r.writer_uid,
                status: r.status,
                requested_by: r.requested_by,
                createdAt: r.createdAt,
                writer: r.writer_details ? {
                    uid: r.writer_details.uid,
                    full_name: r.writer_details.full_name,
                    email: r.writer_details.email,
                    profileImage: r.writer_details.profileImage,
                    skills: r.writer_details.skills,
                    isActive: r.writer_details.isActive,
                    createdAt: r.writer_details.createdAt,
                    stories_count: r.writer_details.stories_count || 0,
                    followers_count: r.writer_details.followers_count || 0,
                    average_rating: r.writer_details.average_rating || 0,
                    bio: r.writer_details.bio || "",
                    genre_specialization: r.writer_details.genre_specialization || [],
                    activity_status: r.writer_details.activity_status || "active",
                } : null
            }));

            return res.status(200).json({
                status: 200,
                message: "Team requests fetched successfully",
                data: formattedData,
                publisher: {
                    pid: publisherCompany.pid,
                    name: publisherCompany.name,
                    logo_url: publisherCompany.logo_url,
                }
            });
        } catch (error) {
            console.error("Error during getTeamRequests:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    /**
     * POST /update_team_request/:writerUid
     * Publisher accepts, rejects, or removes a writer from their team.
     * Body: { request_type: 'Accepted' | 'Rejected' | 'Cancelled' }
     */
    async updateTeamRequest(req, res, token_data) {
        try {
            const writerUid = req.params.writerUid;
            const request_type = req.body.request_type;
            const role = token_data.role;

            if (!["publisher", "both"].includes(role)) {
                return res.status(403).json({ status: 403, message: "Access denied. Publishers only.", data: {} });
            }

            const validTypes = ['Accepted', 'Rejected', 'Cancelled'];
            if (!validTypes.includes(request_type)) {
                return res.status(400).json({ status: 400, message: `request_type must be one of: ${validTypes.join(', ')}`, data: {} });
            }

            // Get publisher company
            const publisherCompany = await this.publisherFunc.findOnePublisher({ uids: token_data.uid });
            if (!publisherCompany) {
                return res.status(404).json({ status: 404, message: "Publisher company not found for this user", data: {} });
            }

            const pid = publisherCompany.pid;

            // Verify assignment exists
            const existingRequest = await this.publisherFunc.findAssignedPublisher({ pid, writer_uid: writerUid });
            if (!existingRequest) {
                return res.status(404).json({ status: 404, message: "Assignment not found between this publisher and writer", data: {} });
            }

            await this.publisherFunc.updateAssignedPublisher(
                { pid, writer_uid: writerUid },
                { status: request_type, updatedAt: moment().unix().toString() }
            );

            const messages = {
                Accepted: "Writer has been accepted to your team",
                Rejected: "Writer request has been rejected",
                Cancelled: "Writer has been removed from your team"
            };

            return res.status(200).json({
                status: 200,
                message: messages[request_type],
                data: {}
            });
        } catch (error) {
            console.error("Error during updateTeamRequest:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    /**
     * GET /writer_stats/:writerUid
     * Get or initialize stats for a specific writer.
     */
    async getWriterStats(req, res, token_data) {
        try {
            const writerUid = req.params.writerUid;
            if (!writerUid) {
                return res.status(400).json({ status: 400, message: "Missing writerUid", data: {} });
            }
            let stats = await this.writerStatsFunc.findByWriterUid(writerUid);
            if (!stats) {
                // Auto-create empty stats entry
                stats = await this.writerStatsFunc.upsert(writerUid, { writer_uid: writerUid });
            }
            return res.status(200).json({ status: 200, message: "Writer stats fetched", data: stats });
        } catch (error) {
            console.error("Error during getWriterStats:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    /**
     * POST /writer_stats/:writerUid
     * Update stats for a writer (bio, genres, activity, etc.)
     */
    /**
     * POST /writer_stats/:writerUid
     * Update stats for a writer (bio, genres, activity, etc.)
     */
    async updateWriterStats(req, res, token_data) {
        try {
            const writerUid = req.params.writerUid;
            const allowed = ['bio', 'genre_specialization', 'activity_status'];
            const update = {};
            allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

            const stats = await this.writerStatsFunc.upsert(writerUid, update);
            return res.status(200).json({ status: 200, message: "Writer stats updated", data: stats });
        } catch (error) {
            console.error("Error during updateWriterStats:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    /**
     * GET /publisher_profile/:pid
     * Fetch full publisher profile — accessible by any authenticated user.
     */
    async getPublisherProfile(req, res, token_data) {
        try {
            const pid = req.params.pid;
            if (!pid) {
                return res.status(400).json({ status: 400, message: "Missing pid parameter", data: {} });
            }
            const publisher = await this.publisherFunc.getPublisherProfile(pid);
            if (!publisher) {
                return res.status(404).json({ status: 404, message: "Publisher not found", data: {} });
            }
            return res.status(200).json({ status: 200, message: "Publisher profile fetched", data: publisher });
        } catch (error) {
            console.error("Error during getPublisherProfile:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    /**
     * GET /publisher_stats/:pid
     * Aggregate analytics (book counts, sales) for a publisher.
     */
    async getPublisherStats(req, res, token_data) {
        try {
            const pid = req.params.pid;
            if (!pid) {
                return res.status(400).json({ status: 400, message: "Missing pid parameter", data: {} });
            }
            const stats = await this.publisherFunc.getPublisherStats(pid);
            return res.status(200).json({ status: 200, message: "Publisher stats fetched", data: stats });
        } catch (error) {
            console.error("Error during getPublisherStats:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    /**
     * GET /publisher_books/:pid
     * Paginated books list for a publisher, with optional category filter.
     * Query params: page, limit, category
     */
    async getPublisherBooks(req, res, token_data) {
        try {
            const pid = req.params.pid;
            if (!pid) {
                return res.status(400).json({ status: 400, message: "Missing pid parameter", data: {} });
            }
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
            const category = req.query.category || "all";
            const skip = (page - 1) * limit;

            const { books, total } = await this.publisherFunc.getPublisherBooks(pid, skip, limit, category);
            const totalPages = Math.ceil(total / limit);

            return res.status(200).json({
                status: 200,
                message: "Publisher books fetched",
                data: books,
                meta: { total, page, limit, totalPages }
            });
        } catch (error) {
            console.error("Error during getPublisherBooks:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    /**
     * GET /publisher_categories/:pid
     * Fetch distinct content categories for a publisher.
     */
    async getPublisherCategories(req, res, token_data) {
        try {
            const pid = req.params.pid;
            if (!pid) {
                return res.status(400).json({ status: 400, message: "Missing pid parameter", data: {} });
            }
            const categories = await this.publisherFunc.getPublisherCategories(pid);
            return res.status(200).json({ status: 200, message: "Publisher categories fetched", data: categories });
        } catch (error) {
            console.error("Error during getPublisherCategories:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }
}

module.exports = PublisherController;
