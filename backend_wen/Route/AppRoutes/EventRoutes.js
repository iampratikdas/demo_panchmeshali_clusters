//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Method
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const { MethodValidate } = require("../../utils/Method_Check.js");


const initializes = require("../../resuable_functions/Initializer.js")


class EventRoutes {

    async Routes(router, EventController , userFunc) {
      console.log("checking================> Events")
      
      router.get("/event_lists", (req, res, next) => MethodValidate(req, res, next, "get"), async (req, res) => await initializes(req, res, userFunc ,  ["admin", "manager"]).then((token_data) => token_data && EventController.eventLists(req, res, token_data)).catch((data)=> {
         return res.status(404).json({ status: 404,message: data.message, data: {} });
     }));
      router.get("/event_lists_users", (req, res, next) => MethodValidate(req, res, next, "get"),(req, res) => EventController.eventListsUsers(req, res));
      router.post("/create_events", (req, res, next) => MethodValidate(req, res, next, "post"), async (req, res) => await initializes(req, res, userFunc ,  ["admin", "manager"]).then((token_data) => token_data && EventController.createEvents(req, res, token_data)).catch((data)=> {
         return res.status(404).json({ status: 404,message: data.message, data: {} });
     }));
      router.put("/update_events", (req, res, next) => MethodValidate(req, res, next, "put"), async (req, res) => await initializes(req, res, userFunc ,  ["admin", "manager"]).then((token_data) => token_data && EventController.updatedEvents(req, res, token_data)).catch((data)=> {
         return res.status(404).json({ status: 404,message: data.message, data: {} });
     }));
      router.delete("/delete_events", (req, res, next) => MethodValidate(req, res, next, "delete"), async (req, res) => await initializes(req, res, userFunc,  ["admin", "manager"]).then((token_data) => token_data && EventController.deletEvents(req, res, token_data)).catch((data)=> {
         return res.status(404).json({ status: 404,message: data.message, data: {} });
     }));
     
    }
}
module.exports = EventRoutes;