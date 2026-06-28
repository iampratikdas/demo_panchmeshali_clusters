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
            const proofreaderUids = body.proofreader_uids;

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
            if (!Array.isArray(uid) || uid.length === 0) {
                return res.status(400).json({ status: 400, message: "At least one manager or publisher is required", data: {} });
            }
            if (!Array.isArray(proofreaderUids) || proofreaderUids.length === 0) {
                return res.status(400).json({ status: 400, message: "At least one proofreader is required", data: {} });
            }

            const proofreaders = await this.userFunc.userListByData({ uid: { $in: proofreaderUids } });
            if (proofreaders.length !== proofreaderUids.length) {
                return res.status(400).json({ status: 400, message: "One or more proofreaders were not found", data: {} });
            }
            const invalidProofreaders = proofreaders.filter(user => user.role !== "proofreader");
            if (invalidProofreaders.length > 0) {
                return res.status(400).json({ status: 400, message: "Selected users must have the proofreader role", data: {} });
            }

            const existingCompany = await this.publisherFunc.findOnePublisher({ email: body.email });
            if (existingCompany) {
                return res.status(409).json({ status: 409, message: "Publisher company already exists for this user", data: {} });
            }

            const companyData = {
                pid: gen(10),
                uids: uid,
                proofreader_uids: proofreaderUids,
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
     * POST /update_publisher_company/:pid
     * Admin updates an existing publisher company.
     */
    async updateCompany(req, res, user_data) {
        try {
            const pid = req.params.pid;
            const body = req.body;
            const uid = body.uids;
            const proofreaderUids = body.proofreader_uids;

            if (user_data.role !== "admin") {
                return res.status(403).json({ status: 403, message: "Access denied. Admins only.", data: {} });
            }
            if (!pid) {
                return res.status(400).json({ status: 400, message: "Missing pid parameter", data: {} });
            }
            if (!body.name) {
                return res.status(400).json({ status: 400, message: "Company name is required", data: {} });
            }
            if (!body.email) {
                return res.status(400).json({ status: 400, message: "Company email is required", data: {} });
            }
            if (!body.phone) {
                return res.status(400).json({ status: 400, message: "Company phone is required", data: {} });
            }
            if (!Array.isArray(uid) || uid.length === 0) {
                return res.status(400).json({ status: 400, message: "At least one manager or publisher is required", data: {} });
            }
            if (!Array.isArray(proofreaderUids) || proofreaderUids.length === 0) {
                return res.status(400).json({ status: 400, message: "At least one proofreader is required", data: {} });
            }

            const existingCompany = await this.publisherFunc.findOnePublisher({ pid });
            if (!existingCompany) {
                return res.status(404).json({ status: 404, message: "Publisher company not found", data: {} });
            }

            const duplicateEmail = await this.publisherFunc.findOnePublisher({ email: body.email, pid: { $ne: pid } });
            if (duplicateEmail) {
                return res.status(409).json({ status: 409, message: "Another company already uses this email", data: {} });
            }

            const proofreaders = await this.userFunc.userListByData({ uid: { $in: proofreaderUids } });
            if (proofreaders.length !== proofreaderUids.length) {
                return res.status(400).json({ status: 400, message: "One or more proofreaders were not found", data: {} });
            }
            const invalidProofreaders = proofreaders.filter(user => user.role !== "proofreader");
            if (invalidProofreaders.length > 0) {
                return res.status(400).json({ status: 400, message: "Selected users must have the proofreader role", data: {} });
            }

            const publishers = await this.userFunc.userListByData({ uid: { $in: uid } });
            if (publishers.length !== uid.length) {
                return res.status(400).json({ status: 400, message: "One or more publisher users were not found", data: {} });
            }

            const allowedStatuses = ["Active", "Pending", "Inactive"];
            const status = allowedStatuses.includes(body.status) ? body.status : existingCompany.status;

            const updateData = {
                uids: uid,
                proofreader_uids: proofreaderUids,
                name: body.name,
                description: body.description || "",
                email: body.email,
                phone: body.phone,
                logo_url: body.logo_url || "",
                rgst_gov_id: body.rgst_gov_id || "",
                address: body.address || "",
                city: body.city || "",
                state: body.state || "",
                country: body.country || "",
                zip_code: body.zip_code || "",
                status,
                updatedAt: moment().unix(),
            };

            await this.publisherFunc.updatePublisherByPid(pid, updateData);
            const updatedCompany = await this.publisherFunc.findOnePublisher({ pid });

            return res.status(200).json({
                status: 200,
                message: "Publisher company updated successfully",
                data: updatedCompany,
            });
        } catch (error) {
            console.error("Error updating publisher company:", error);
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

            request_type === "Cancelled" || request_type === "Rejected" ? await this.publisherFunc.cancelledAssignedPublisher({ pid, writer_uid }) : await this.publisherFunc.updateAssignedPublisher({ pid, writer_uid }, { status: request_type })

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
            if (!["publisher", "both", "manager"].includes(role)) {
                return res.status(403).json({ status: 403, message: "Access denied. Publishers only.", data: {} });
            }

            const userCompanies = await this.publisherFunc.findPublishersByUserUid(token_data.uid);
            if (!userCompanies || userCompanies.length === 0) {
                return res.status(404).json({ status: 404, message: "No publisher company found for this user", data: [] });
            }

            let pid = req.query.pid;
            if (pid) {
                const isAssigned = userCompanies.some(company => company.pid === pid);
                if (!isAssigned) {
                    return res.status(403).json({ status: 403, message: "You are not assigned to this publisher company", data: [] });
                }
            } else {
                pid = userCompanies[0].pid;
            }

            const activeCompany = userCompanies.find(company => company.pid === pid) || userCompanies[0];
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
                    pid: activeCompany.pid,
                    name: activeCompany.name,
                    logo_url: activeCompany.logo_url || "",
                    status: activeCompany.status,
                },
                companies: userCompanies.map(company => ({
                    pid: company.pid,
                    name: company.name,
                    logo_url: company.logo_url || "",
                    status: company.status,
                })),
            });
        } catch (error) {
            console.error("Error during getTeamRequests:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }
    async getUserTeamRequests(req, res, token_data) {
        try {
            const role = token_data.role;
            if (!["writer"].includes(role)) {
                return res.status(403).json({ status: 403, message: "Access denied. Writers only.", data: {} });
            }
            const requests = await this.publisherFunc.getRequestsForWriter(token_data.uid);


            return res.status(200).json({
                status: 200,
                message: "Team requests fetched successfully",
                data: requests
            });
        } catch (error) {
            console.error("Error during getUserTeamRequests:", error);
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

            if (!["publisher", "both", "manager"].includes(role)) {
                return res.status(403).json({ status: 403, message: "Access denied. Publishers only.", data: {} });
            }

            const validTypes = ['Accepted', 'Rejected', 'Cancelled'];
            if (!validTypes.includes(request_type)) {
                return res.status(400).json({ status: 400, message: `request_type must be one of: ${validTypes.join(', ')}`, data: {} });
            }

            const userCompanies = await this.publisherFunc.findPublishersByUserUid(token_data.uid);
            if (!userCompanies || userCompanies.length === 0) {
                return res.status(404).json({ status: 404, message: "Publisher company not found for this user", data: {} });
            }

            let pid = req.body.pid;
            if (pid) {
                const isAssigned = userCompanies.some(company => company.pid === pid);
                if (!isAssigned) {
                    return res.status(403).json({ status: 403, message: "You are not assigned to this publisher company", data: {} });
                }
            } else {
                pid = userCompanies[0].pid;
            }

            // Verify assignment exists
            const existingRequest = await this.publisherFunc.findAssignedPublisher({ pid, writer_uid: writerUid });
            if (!existingRequest) {
                return res.status(404).json({ status: 404, message: "Assignment not found between this publisher and writer", data: {} });
            }
            request_type === "Cancelled" ? await this.publisherFunc.cancelledAssignedPublisher({ pid, writer_uid: writerUid }) : await this.publisherFunc.updateAssignedPublisher(
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
     * Returns full publisher profile — dummy data for demo.
     */
    async getPublisherProfile(req, res, token_data) {
        try {
            const pid = req.params.pid;
            if (!pid) {
                return res.status(400).json({ status: 400, message: "Missing pid parameter", data: {} });
            }

            // ── Try real DB first, fall back to dummy if not found ────────────
            const realPublisher = await this.publisherFunc.getPublisherProfile(pid);

            const dummyProfile = {
                pid,
                name: realPublisher?.name || "Kotharkotha Publications",
                description: realPublisher?.description || "A premier publishing house dedicated to bringing the finest Bengali literature, fiction, and cultural narratives to readers worldwide. We champion new voices and timeless classics alike.",
                email: realPublisher?.email || "hello@kotharkotha.com",
                phone: realPublisher?.phone || "+91 98300 12345",
                logo_url: realPublisher?.logo_url || "",
                address: realPublisher?.address || "12, Rabindra Sarani",
                city: realPublisher?.city || "Kolkata",
                state: realPublisher?.state || "West Bengal",
                country: realPublisher?.country || "India",
                zip_code: realPublisher?.zip_code || "700073",
                status: realPublisher?.status || "Active",
                rgst_gov_id: realPublisher?.rgst_gov_id || "AABCK1234F",
                createdAt: realPublisher?.createdAt || "1700000000",
                updatedAt: realPublisher?.updatedAt || "1700000000",
            };

            return res.status(200).json({ status: 200, message: "Publisher profile fetched", data: dummyProfile });
        } catch (error) {
            console.error("Error during getPublisherProfile:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    /**
     * GET /publisher_stats/:pid
     * Returns analytics — dummy data for demo.
     */
    async getPublisherStats(req, res, token_data) {
        try {
            const pid = req.params.pid;
            if (!pid) {
                return res.status(400).json({ status: 400, message: "Missing pid parameter", data: {} });
            }

            // ── Try real aggregation, overlay dummy when zeros ────────────────
            let stats = { total_books: 0, total_ebooks: 0, total_sales: 0, books_sold: 0, ebooks_sold: 0, active_categories: 0 };
            try { stats = await this.publisherFunc.getPublisherStats(pid); } catch (_) { }

            const dummyStats = {
                total_books: stats.total_books > 0 ? stats.total_books : 128,
                total_ebooks: stats.total_ebooks > 0 ? stats.total_ebooks : 74,
                total_sales: stats.total_sales > 0 ? stats.total_sales : 18420,
                books_sold: stats.books_sold > 0 ? stats.books_sold : 12300,
                ebooks_sold: stats.ebooks_sold > 0 ? stats.ebooks_sold : 6120,
                active_categories: stats.active_categories > 0 ? stats.active_categories : 9,
            };

            return res.status(200).json({ status: 200, message: "Publisher stats fetched", data: dummyStats });
        } catch (error) {
            console.error("Error during getPublisherStats:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    /**
     * GET /publisher_books/:pid
     * Returns paginated books — falls back to dummy data when DB is empty.
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

            // Try real DB
            let realBooks = [], realTotal = 0;
            try {
                const result = await this.publisherFunc.getPublisherBooks(pid, skip, limit, category);
                realBooks = result.books || [];
                realTotal = result.total || 0;
            } catch (_) { }

            if (realBooks.length > 0) {
                const totalPages = Math.ceil(realTotal / limit);
                return res.status(200).json({
                    status: 200, message: "Publisher books fetched",
                    data: realBooks, meta: { total: realTotal, page, limit, totalPages }
                });
            }

            // ── Dummy books pool ──────────────────────────────────────────────
            const dummyPool = [
                { _id: "d1", cont_id: "cont_d1", name: "আলোর পথে", type: "book", category: "fiction", url: "https://picsum.photos/seed/book1/200/280", sales_count: 1420, status: "Approved" },
                { _id: "d2", cont_id: "cont_d2", name: "The Midnight Garden", type: "ebook", category: "romance", url: "https://picsum.photos/seed/book2/200/280", sales_count: 980, status: "Approved" },
                { _id: "d3", cont_id: "cont_d3", name: "রহস্যের জাল", type: "book", category: "mystery", url: "https://picsum.photos/seed/book3/200/280", sales_count: 2100, status: "Approved" },
                { _id: "d4", cont_id: "cont_d4", name: "Stars Beyond Time", type: "ebook", category: "sci-fi", url: "https://picsum.photos/seed/book4/200/280", sales_count: 760, status: "Approved" },
                { _id: "d5", cont_id: "cont_d5", name: "ভূতের বাড়ি", type: "book", category: "horror", url: "https://picsum.photos/seed/book5/200/280", sales_count: 3300, status: "Approved" },
                { _id: "d6", cont_id: "cont_d6", name: "The Silent Echo", type: "book", category: "fiction", url: "https://picsum.photos/seed/book6/200/280", sales_count: 540, status: "Approved" },
                { _id: "d7", cont_id: "cont_d7", name: "প্রেমের কবিতা", type: "ebook", category: "romance", url: "https://picsum.photos/seed/book7/200/280", sales_count: 890, status: "Approved" },
                { _id: "d8", cont_id: "cont_d8", name: "Quantum Ghosts", type: "ebook", category: "sci-fi", url: "https://picsum.photos/seed/book8/200/280", sales_count: 1650, status: "Approved" },
                { _id: "d9", cont_id: "cont_d9", name: "অন্ধকারের ছায়া", type: "book", category: "ghost", url: "https://picsum.photos/seed/book9/200/280", sales_count: 2800, status: "Approved" },
                { _id: "d10", cont_id: "cont_d10", name: "The Living Myth", type: "book", category: "non-fiction", url: "https://picsum.photos/seed/book10/200/280", sales_count: 470, status: "Approved" },
                { _id: "d11", cont_id: "cont_d11", name: "সত্যের সন্ধানে", type: "book", category: "non-fiction", url: "https://picsum.photos/seed/book11/200/280", sales_count: 310, status: "Approved" },
                { _id: "d12", cont_id: "cont_d12", name: "Crimson Petals", type: "ebook", category: "romance", url: "https://picsum.photos/seed/book12/200/280", sales_count: 1100, status: "Approved" },
                { _id: "d13", cont_id: "cont_d13", name: "রাতের শিকারি", type: "book", category: "mystery", url: "https://picsum.photos/seed/book13/200/280", sales_count: 1760, status: "Approved" },
                { _id: "d14", cont_id: "cont_d14", name: "Beyond the Veil", type: "ebook", category: "ghost", url: "https://picsum.photos/seed/book14/200/280", sales_count: 920, status: "Approved" },
                { _id: "d15", cont_id: "cont_d15", name: "জীবনের গল্প", type: "book", category: "fiction", url: "https://picsum.photos/seed/book15/200/280", sales_count: 2200, status: "Approved" },
                { _id: "d16", cont_id: "cont_d16", name: "Neon Dystopia", type: "ebook", category: "sci-fi", url: "https://picsum.photos/seed/book16/200/280", sales_count: 1380, status: "Approved" },
            ];

            // Filter by category
            const filtered = category === "all"
                ? dummyPool
                : dummyPool.filter(b => b.category.toLowerCase() === category.toLowerCase());

            // Paginate
            const total = filtered.length;
            const paginated = filtered.slice(skip, skip + limit);
            const totalPages = Math.ceil(total / limit);

            return res.status(200).json({
                status: 200,
                message: "Publisher books fetched",
                data: paginated,
                meta: { total, page, limit, totalPages }
            });
        } catch (error) {
            console.error("Error during getPublisherBooks:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    /**
     * GET /publisher_categories/:pid
     * Returns distinct content categories — dummy data when DB is empty.
     */
    async getPublisherCategories(req, res, token_data) {
        try {
            const pid = req.params.pid;
            if (!pid) {
                return res.status(400).json({ status: 400, message: "Missing pid parameter", data: {} });
            }

            let categories = [];
            try { categories = await this.publisherFunc.getPublisherCategories(pid); } catch (_) { }

            // Supplement with dummy if DB returns nothing
            const dummyCategories = categories.length > 0
                ? categories
                : ["fiction", "romance", "mystery", "sci-fi", "horror", "ghost", "non-fiction", "poetry", "biography"];

            return res.status(200).json({ status: 200, message: "Publisher categories fetched", data: dummyCategories });
        } catch (error) {
            console.error("Error during getPublisherCategories:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }

    /**
     * GET /my_publisher_companies
     * Returns publisher companies assigned to the logged-in user (all for admin).
     */
    async getMyPublisherCompanies(req, res, token_data) {
        try {
            const role = token_data.role;
            let companies = [];

            if (role === "admin") {
                companies = await this.publisherFunc.findAllPublishers();
            } else if (["publisher", "manager", "both"].includes(role)) {
                companies = await this.publisherFunc.findPublishersByUserUid(token_data.uid);
            } else {
                return res.status(403).json({ status: 403, message: "Access denied.", data: [] });
            }

            const formatted = companies.map(company => ({
                pid: company.pid,
                name: company.name,
                status: company.status,
            }));

            return res.status(200).json({
                status: 200,
                message: "Assigned publisher companies fetched successfully",
                data: formatted,
            });
        } catch (error) {
            console.error("Error fetching assigned publisher companies:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: [] });
        }
    }

    /**
     * GET /publisher_team_lists
     * Fetches the users mentioned in the uids array of the publisher company.
     */
    async getPublisherTeamLists(req, res, token_data) {
        try {
            const role = token_data.role;
            if (!["publisher", "admin", "manager"].includes(role)) {
                return res.status(403).json({ status: 403, message: "Access denied.", data: {} });
            }

            // Find the publisher company for the logged-in publisher
            const publisherCompany = await this.publisherFunc.findOnePublisher({ uids: { "$in": [token_data.uid] } });
            if (!publisherCompany || publisherCompany.length === 0) {
                return res.status(404).json({ status: 404, message: "No publisher company found for this user", data: [] });
            }

            const company = publisherCompany;
            const uids = company.uids || [];

            if (uids.length === 0) {
                return res.status(200).json({ status: 200, message: "No team members found", data: [] });
            }

            // Fetch users based on uids
            // Wait, we need to query user collection
            const teamUsers = await this.userFunc.userListByData({ uid: { "$in": uids } });

            const formattedUsers = teamUsers.map(user => ({
                uid: user.uid,
                full_name: user.full_name,
                email: user.email,
                profileImage: user.profileImage,
                skills: user.skills
            }));

            return res.status(200).json({ status: 200, message: "Team list fetched successfully", data: formattedUsers });

        } catch (error) {
            console.error("Error fetching publisher team lists:", error);
            res.status(500).json({ status: 500, message: "Internal server error", data: {} });
        }
    }
}

module.exports = PublisherController;
