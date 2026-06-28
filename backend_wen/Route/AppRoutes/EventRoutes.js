//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Method
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const { MethodValidate } = require("../../utils/Method_Check.js");


const initializes = require("../../resuable_functions/Initializer.js")


class EventRoutes {

    async Routes(router, EventController, userFunc) {
        console.log("checking================> Events")
        // Writers request to join an event
        router.post("/request_for_event", (req, res, next) => MethodValidate(req, res, next, "post"), async (req, res) => await initializes(req, res, userFunc, ["writer", "both"]).then((token_data) => token_data && EventController.requestForEvent(req, res, token_data)).catch((data) => {
            return res.status(404).json({ status: 404, message: data.message, data: {} });
        }));

        // Publishers accept/reject a writer's request
        router.post("/update_event_request_status", (req, res, next) => MethodValidate(req, res, next, "post"), async (req, res) => await initializes(req, res, userFunc, ["publisher", "manager", "admin"]).then((token_data) => token_data && EventController.updateEventRequestStatus(req, res, token_data)).catch((data) => {
            return res.status(404).json({ status: 404, message: data.message, data: {} });
        }));
        router.get("/event_lists", (req, res, next) => MethodValidate(req, res, next, "get"), async (req, res) => await initializes(req, res, userFunc, ["admin", "manager", "publisher"]).then((token_data) => token_data && EventController.eventLists(req, res, token_data)).catch((data) => {
            return res.status(404).json({ status: 404, message: data.message, data: {} });
        }));
        router.get("/event_lists_users", (req, res, next) => MethodValidate(req, res, next, "get"), async (req, res) => await initializes(req, res, userFunc, ["writer", "both"]).then((token_data) => token_data && EventController.eventListsUsers(req, res, token_data)).catch((data) => {
            return res.status(404).json({ status: 404, message: data.message, data: {} });
        }));
        router.post("/create_events", (req, res, next) => MethodValidate(req, res, next, "post"), async (req, res) => await initializes(req, res, userFunc, ["admin", "manager", "publisher"]).then((token_data) => token_data && EventController.createEvents(req, res, token_data)).catch((data) => {
            return res.status(404).json({ status: 404, message: data.message, data: {} });
        }));
        router.put("/update_events", (req, res, next) => MethodValidate(req, res, next, "put"), async (req, res) => await initializes(req, res, userFunc, ["admin", "manager", "publisher"]).then((token_data) => token_data && EventController.updatedEvents(req, res, token_data)).catch((data) => {
            return res.status(404).json({ status: 404, message: data.message, data: {} });
        }));
        router.delete("/delete_events", (req, res, next) => MethodValidate(req, res, next, "delete"), async (req, res) => await initializes(req, res, userFunc, ["admin", "manager", "publisher"]).then((token_data) => token_data && EventController.deletEvents(req, res, token_data)).catch((data) => {
            return res.status(404).json({ status: 404, message: data.message, data: {} });
        }));

        // Writer fetches all active events (enriched with publisher name + join status)
        router.get("/active_events", (req, res, next) => MethodValidate(req, res, next, "get"), async (req, res) => await initializes(req, res, userFunc, ["writer", "both"]).then((token_data) => token_data && EventController.getActiveEvents(req, res, token_data)).catch((data) => {
            return res.status(404).json({ status: 404, message: data.message, data: {} });
        }));

        // Writer joins a non-paid active event directly
        router.post("/join_event", (req, res, next) => MethodValidate(req, res, next, "post"), async (req, res) => await initializes(req, res, userFunc, ["writer", "both"]).then((token_data) => token_data && EventController.joinEvent(req, res, token_data)).catch((data) => {
            return res.status(404).json({ status: 404, message: data.message, data: {} });
        }));

    }
}
module.exports = EventRoutes;