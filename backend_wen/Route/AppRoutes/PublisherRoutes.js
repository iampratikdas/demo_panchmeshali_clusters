const initializes = require("../../resuable_functions/Initializer.js");
const { MethodValidate } = require("../../utils/Method_Check.js");
class Publisher {
    async Routes(router, publisherController, userFunc) {
        router.get("/publisher_lists/:uid", (req, res, next) => MethodValidate(req, res, next, "GET"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.publisherlists(req, res, token_data)));
        router.post("/request_publisher_users/:uid", (req, res, next) => MethodValidate(req, res, next, "POST"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.addpublisher(req, res, token_data)));
        router.post("/remove_publisher_users/:uid", (req, res, next) => MethodValidate(req, res, next, "POST"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.updatepublisher(req, res, token_data)));
    }
}
module.exports = Publisher;