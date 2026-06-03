//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Import Default
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const moment = require("moment");
const Publisherschema = require("../../models/monogdb/Publishers");
const Contentschema = require("../../models/monogdb/Contents");
const Userschema = require("../../models/monogdb/User");
const WritersAssignedPublishersschema = require("../../models/monogdb/WritersAssignedPublishers");
const Setup = require("../../db/mongodb/setupDatabase");

class PublishersFunctions {
    constructor() {
        (async () => {
            this.publishermodel = await Publisherschema(await Setup.getConnection());
            this.contentmodel = await Contentschema(await Setup.getConnection());
            this.usermodel = await Userschema(await Setup.getConnection());
            this.assignedPublishersModel = await WritersAssignedPublishersschema(await Setup.getConnection());
        })()
    }

    async findOnePublisher(data) {
        return await this.publishermodel.find(data).lean()
    }
    async findAllPublishers(data = {}) {
        return await this.publishermodel.find(data).sort({ createdAt: -1 }).lean()
    }
    async publisherCount(data) {
        return await this.publishermodel.find(data).countDocuments().lean()
    }
    async publisherListByData(data, skip = 0, limit = 0) {
        return await this.publishermodel.find(data).skip(skip).limit(limit).sort({ createdAt: -1 }).lean()
    }

    /**
     * Get all publishers assigned to a writer (by writer_uid).
     * Joins with Publishers collection on pid.
     */
    async getAssignedPublishers(writer_uid) {
        try {

            const ddd = await this.assignedPublishersModel
                .find({

                    writer_uid: writer_uid,
                    status: {
                        $in: ['Active', 'Pending'],
                    },
                })
                .distinct('pid');
            console.log("asigned=============>", ddd)
            return ddd.length > 0 ? await this.publishermodel.find({ pid: { "$nin": ddd }, status: "Active" }).sort({ createdAt: -1 }).lean() : await this.publishermodel.find({ status: "Active" }).sort({ createdAt: -1 }).lean();



        } catch (error) {
            console.error("Error fetching assigned publishers:", error);
            throw new Error("Failed to fetch assigned publishers");
        }
    }

    /**
     * Get all pubisher list 
     */
    async getRequestsForWriter(uid) {
        try {
            const re = await this.assignedPublishersModel.aggregate([
                {
                    $match: {
                        writer_uid: uid
                    }
                },
                {
                    $lookup: {
                        from: "publishers",
                        localField: "pid",
                        foreignField: "pid",
                        as: "publisher_details"
                    }
                },
                {
                    $unwind: {
                        path: "$publisher_details",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        publisher_details: 1
                    }
                }
            ]);
            return re;

        } catch (error) {
            console.error("Error fetching assigned publishers:", error);
            throw new Error("Failed to fetch assigned publishers");
        }
    }

    /**
     * Get all writer requests for a given writer (by writer_uid).
     * Joins with User collection on pid.
     * Also joins with WriterStats on writer_uid.
     * Also calculates stories_count from contents.
     */
    async getWriterRequestsForPublisher(pid) {
        try {
            return await this.assignedPublishersModel.aggregate([
                { $match: { pid: pid } },
                {
                    $lookup: {
                        from: "users",
                        localField: "writer_uid",
                        foreignField: "uid",
                        as: "writer_details"
                    }
                },
                { $unwind: { path: "$writer_details", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "writerstats",
                        localField: "writer_uid",
                        foreignField: "writer_uid",
                        as: "writer_stats"
                    }
                },
                { $unwind: { path: "$writer_stats", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "contents",
                        localField: "writer_uid",
                        foreignField: "uid",
                        as: "writer_contents"
                    }
                },
                {
                    $addFields: {
                        "writer_details.stories_count": { $size: { $ifNull: ["$writer_contents", []] } },
                        "writer_details.followers_count": { $ifNull: ["$writer_stats.followers_count", 0] },
                        "writer_details.average_rating": { $ifNull: ["$writer_stats.average_rating", 0] },
                        "writer_details.bio": { $ifNull: ["$writer_stats.bio", ""] },
                        "writer_details.genre_specialization": { $ifNull: ["$writer_stats.genre_specialization", []] },
                        "writer_details.activity_status": { $ifNull: ["$writer_stats.activity_status", "active"] }
                    }
                },
                {
                    $project: {
                        writer_contents: 0  // Don't return all content docs, just the count
                    }
                }
            ]);
        } catch (error) {
            console.error("Error fetching writer requests for publisher:", error);
            throw new Error("Failed to fetch writer requests");
        }
    }

    async findAssignedPublisher(query) {
        return await this.assignedPublishersModel.findOne(query).lean();
    }

    async insertAssignedPublisher(data) {
        try {
            return await this.assignedPublishersModel.create(data);
        } catch (error) {
            console.error("Error inserting assigned publisher request:", error);
            throw new Error("Failed to insert assigned publisher request");
        }
    }

    async updateAssignedPublisher(filter, update_field) {
        try {
            return await this.assignedPublishersModel.updateOne(filter, { $set: update_field });
        } catch (error) {
            console.error("Error updating assigned publisher request:", error);
            throw new Error("Failed to update assigned publisher request");
        }
    }

    async deletePublisher(data) {
        return await this.publishermodel.deleteOne(data).lean()
    }
    async insertPublisher(publisherData) {
        try {
            return await this.publishermodel.insertOne(publisherData);
        } catch (error) {
            console.error("Error inserting publisher:", error);
            throw new Error("Failed to insert publisher");
        }
    }
    async updatePublisher(publisherData, uid) {
        try {
            return await this.publishermodel.updateOne({ uid: uid }, { $set: publisherData });
        } catch (error) {
            console.error("Error updating publisher:", error);
            throw new Error("Failed to update publisher");
        }
    }

    /**
     * GET /publisher_profile/:pid
     * Fetch a single publisher's full profile by pid.
     */
    async getPublisherProfile(pid) {
        try {
            return await this.publishermodel.findOne({ pid }).lean();
        } catch (error) {
            console.error("Error fetching publisher profile:", error);
            throw new Error("Failed to fetch publisher profile");
        }
    }

    /**
     * GET /publisher_stats/:pid
     * Aggregate analytics for a publisher from the Contents collection.
     * Returns: total_books, total_ebooks, total_sales, books_sold, ebooks_sold, active_categories
     */
    async getPublisherStats(pid) {
        try {
            const Categoryschema = require("../../models/monogdb/Categories");
            const Setup = require("../../db/mongodb/setupDatabase");
            const categorymodel = await Categoryschema(await Setup.getConnection());

            const [contentStats] = await this.contentmodel.aggregate([
                { $match: { page_id: pid } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        total_books: {
                            $sum: { $cond: [{ $eq: ["$type", "book"] }, 1, 0] }
                        },
                        total_ebooks: {
                            $sum: { $cond: [{ $eq: ["$type", "ebook"] }, 1, 0] }
                        },
                        total_sales: { $sum: { $ifNull: ["$sales_count", 0] } },
                        books_sold: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$type", "book"] },
                                    { $ifNull: ["$sales_count", 0] },
                                    0
                                ]
                            }
                        },
                        ebooks_sold: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$type", "ebook"] },
                                    { $ifNull: ["$sales_count", 0] },
                                    0
                                ]
                            }
                        },
                        categories: { $addToSet: "$category" }
                    }
                }
            ]);

            // Count active categories for this publisher (global + publisher-specific)
            const activeCategoryCount = await categorymodel.countDocuments({
                $or: [{ is_global: true }, { pid: pid }]
            });

            return {
                total_books: contentStats?.total_books ?? 0,
                total_ebooks: contentStats?.total_ebooks ?? 0,
                total_sales: contentStats?.total_sales ?? 0,
                books_sold: contentStats?.books_sold ?? 0,
                ebooks_sold: contentStats?.ebooks_sold ?? 0,
                active_categories: activeCategoryCount ?? 0,
            };
        } catch (error) {
            console.error("Error fetching publisher stats:", error);
            throw new Error("Failed to fetch publisher stats");
        }
    }

    /**
     * GET /publisher_books/:pid
     * Fetch paginated books/ebooks for a publisher with optional category filter.
     */
    async getPublisherBooks(pid, skip = 0, limit = 12, category = null) {
        try {
            const query = { page_id: pid };
            if (category && category !== "all") {
                query.category = { $regex: new RegExp("^" + category + "$", "i") };
            }
            const total = await this.contentmodel.countDocuments(query);
            const books = await this.contentmodel
                .find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean();
            return { books, total };
        } catch (error) {
            console.error("Error fetching publisher books:", error);
            throw new Error("Failed to fetch publisher books");
        }
    }

    /**
     * Get all distinct categories for a publisher's content.
     */
    async getPublisherCategories(pid) {
        try {
            const categories = await this.contentmodel.distinct("category", { page_id: pid });
            return categories.filter(Boolean);
        } catch (error) {
            console.error("Error fetching publisher categories:", error);
            throw new Error("Failed to fetch publisher categories");
        }
    }
}


module.exports = PublishersFunctions;