//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Import Default
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const express = require("express");
const multer = require("multer");


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Method
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const { MethodValidate } = require("../../utils/Method_Check.js");


const initializes = require("../../resuable_functions/Initializer.js")


class ContentRoutes {

    async Routes(router, ContentController, userFunc) {


        router.post("/submit_contents", (req, res, next) => MethodValidate(req, res, next, "post"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && ContentController.submit(req, res, token_data)).catch((data) => {

            return res.status(404).json({ status: 404, message: data.message, data: {} });
        }));
        router.post("/list_contents", (req, res, next) => MethodValidate(req, res, next, "post"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && ContentController.listContents(req, res, token_data)).catch((data) => {

            return res.status(404).json({ status: 404, message: data.message, data: {} });
        }));
        //** We also need to add a separate route for admin or manager role for listing the contents **
        router.get("/list_notice", (req, res, next) => MethodValidate(req, res, next, "get"), (req, res) => ContentController.allNotice(req, res));
        // router.get("/cretificate_fetch", (req, res, next) => MethodValidate(req, res, next, "get"),  (req, res) => ContentController.certificateFetch(req, res));
        router.get("/certificate_fetch", (req, res, next) => MethodValidate(req, res, next, "get"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && ContentController.certificateFetch(req, res, token_data)).catch((data) => {
            return res.status(404).json({ status: 404, message: data.message, data: {} });
        }));


        // created a category list 
        router.post("/create_category", (req, res, next) => MethodValidate(req, res, next, "post"), async (req, res) => await initializes(req, res, userFunc, ["publisher", "admin", "manager"]).then((token_data) => token_data && ContentController.createCategoryByPublisher(req, res, token_data)).catch((data) => {
            return res.status(404).json({ status: 404, message: data.message, data: {} });
        }));
        router.post("/create_category_by_user", (req, res, next) => MethodValidate(req, res, next, "post"), async (req, res) => await initializes(req, res, userFunc, ["writer", "both", "user"]).then((token_data) => token_data && ContentController.createCategoryByUser(req, res, token_data)).catch((data) => {
            return res.status(404).json({ status: 404, message: data.message, data: {} });
        }));
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        //Admin route
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        router.post("/add_marks_by_admins", (req, res, next) => MethodValidate(req, res, next, "POST"), async (req, res) => await initializes(req, res, userFunc, ["admin", "manager"]).then((token_data) => token_data && ContentController.addMarks(req, res, token_data)));
        router.post("/create_notice_by_admin_and_mail", (req, res, next) => MethodValidate(req, res, next, "POST"), async (req, res) => await initializes(req, res, userFunc, ["admin", "manager"]).then((token_data) => token_data && ContentController.createNotice(req, res, token_data)));
        router.get("/fetch_the_content", (req, res, next) => MethodValidate(req, res, next, "GET"), async (req, res) => await initializes(req, res, userFunc, ["admin", "manager"]).then((token_data) => token_data && ContentController.fetchEventOneContent(req, res, token_data)));
    }
}
module.exports = ContentRoutes;