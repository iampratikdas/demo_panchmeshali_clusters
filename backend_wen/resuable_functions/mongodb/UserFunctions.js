//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Import Default
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const moment = require("moment");
const Userschema = require("../../models/monogdb/User");
const Setup = require("../../db/mongodb/setupDatabase");
const mongoose = require("mongoose");
const {
    GenUserToken,
    GetUserAuthorization,
} = require("../../utils/Authorization.js");


class UserFunctions {
    constructor() {
        (async () => {
            this.usermodel = await Userschema(await Setup.getConnection());
        })()
    }

    async checkUser(req) {
        let existingUser = null;
        if (req.headers.authorization) {

            const token_data = await GetUserAuthorization(req.headers.authorization);
            console.log("working=======================>",)
            if (token_data.error_code) {
                throw new Error(token_data.message);
            }
            existingUser = await this.usermodel.findOne({ email: token_data.email }).lean();
            if (!existingUser) {
                throw new Error("User not found.");
            }
            if (existingUser.is_deleted === true) {
                throw new Error("User not found.");
            }
        }
        return existingUser;
    }


    async findOneUserByEmail(email) {
        return await this.usermodel.findOne({ email: email }).lean()
    }
    async findOneUserByUid(uid) {
        return await this.usermodel.findOne({ uid: uid }).lean()
    }
    async userList(data = {}, prj = {}, limit = 0, skip = 0) {
        return await this.usermodel.find(data, prj).skip(skip).limit(limit).lean()
    }
    async userCount(data) {
        return await this.usermodel.find(data).countDocuments().lean()
    }
    async userListByData(data, skip = 0, limit = 0) {
        // console.log("data============>", data, skip , limit)
        return await this.usermodel.find(data).skip(skip).limit(limit).lean()
    }

    async userPagination(req) {
        let page = parseInt(req.query.page) || 1;          // default page 1
        let limit = parseInt(req.query.limit) || 5;       // default 10 per page
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;
        const skip = (page - 1) * limit;
        return {
            skip, limit, page
        }
    }

    async gerProfile(uid) {
        return await this.usermodel.findOne({ uid: uid }).lean()
    }
    async UserInsert(userData) {
        try {
            // console.log("user========================================>", userData)
            return await this.usermodel.insertOne(userData);
        } catch (error) {
            console.error("Error inserting user:", error);
            throw new Error("Failed to insert user");
        }
    }
    async UserUpdate(userData, uid) {
        try {
            // console.log("user========================================>", userData)
            return await this.usermodel.updateOne({ uid: uid },
                { $set: userData },
            );
        } catch (error) {
            console.error("Error inserting user:", error);
            throw new Error("Failed to insert user");
        }
    }
}


module.exports = UserFunctions