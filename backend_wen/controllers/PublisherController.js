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


    async publisherlists(req, res) {
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

    async addpublisher(req, res) {
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

    async updatepublisher(req, res) {
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
