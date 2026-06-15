const initializes = require("../../resuable_functions/Initializer.js");
const { MethodValidate } = require("../../utils/Method_Check.js");
class Publisher {
    async Routes(router, publisherController, userFunc) {

        // ── Existing routes ───────────────────────────────────────────────────────
        router.get("/publisher_lists/:uid", (req, res, next) => MethodValidate(req, res, next, "GET"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.publisherlists(req, res, token_data)));
        router.get("/publisher_companies", (req, res, next) => MethodValidate(req, res, next, "GET"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.getAllCompanies(req, res, token_data)));
        router.post("/request_publisher_users/:uid", (req, res, next) => MethodValidate(req, res, next, "POST"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.addpublisher(req, res, token_data)));
        router.post("/update_publisher_users/:uid", (req, res, next) => MethodValidate(req, res, next, "POST"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.updatepublisher(req, res, token_data)));
        router.post("/create_publisher_company", (req, res, next) => MethodValidate(req, res, next, "POST"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.createCompany(req, res, token_data)));

        // ── Teams section routes ──────────────────────────────────────────────────
        // Publisher: get all writer requests/members for their company
        router.get("/team_requests", (req, res, next) => MethodValidate(req, res, next, "GET"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.getTeamRequests(req, res, token_data)));
        router.get("/team_requests_by_uid", (req, res, next) => MethodValidate(req, res, next, "GET"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.getUserTeamRequests(req, res, token_data)));

        // Publisher: accept / reject / remove a writer
        router.post("/update_team_request/:writerUid", (req, res, next) => MethodValidate(req, res, next, "POST"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.updateTeamRequest(req, res, token_data)));

        // Writer stats
        router.get("/writer_stats/:writerUid", (req, res, next) => MethodValidate(req, res, next, "GET"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.getWriterStats(req, res, token_data)));
        router.post("/writer_stats/:writerUid", (req, res, next) => MethodValidate(req, res, next, "POST"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.updateWriterStats(req, res, token_data)));

        // ── Publisher Detail page routes (any authenticated user) ─────────────────
        router.get("/publisher_profile/:pid", (req, res, next) => MethodValidate(req, res, next, "GET"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.getPublisherProfile(req, res, token_data)));
        router.get("/publisher_stats/:pid", (req, res, next) => MethodValidate(req, res, next, "GET"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.getPublisherStats(req, res, token_data)));
        router.get("/publisher_books/:pid", (req, res, next) => MethodValidate(req, res, next, "GET"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.getPublisherBooks(req, res, token_data)));
        router.get("/publisher_categories/:pid", (req, res, next) => MethodValidate(req, res, next, "GET"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.getPublisherCategories(req, res, token_data)));

        // Publisher team members directly from Publisher collection uids
        router.get("/publisher_team_lists", (req, res, next) => MethodValidate(req, res, next, "GET"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && publisherController.getPublisherTeamLists(req, res, token_data)));
    }
}
module.exports = Publisher;