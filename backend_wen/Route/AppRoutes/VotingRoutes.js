//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Method
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const { MethodValidate } = require("../../utils/Method_Check.js");


const initializes = require("../../resuable_functions/Initializer.js")


class VotingRoutes {

    async Routes(router, VoteController , userFunc) {
      
      router.get("/content_list_for_voting", (req, res, next) => MethodValidate(req, res, next, "get"), async (req, res) => VoteController.contentListForVoting(req, res));
      router.get("/top_5_contents", (req, res, next) => MethodValidate(req, res, next, "get"),async (req, res) => VoteController.topContents(req, res));
      router.post("/vote_a_content", (req, res, next) => MethodValidate(req, res, next, "post"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && VoteController.voteAContent(req, res, token_data)).catch((data)=> {
         return res.status(404).json({ status: 404,message: data.message, data: {} });
     }));
      router.post("/vote_counts_derivatives", (req, res, next) => MethodValidate(req, res, next, "post"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && VoteController.voteCounts(req, res, token_data)).catch((data)=> {
        
         return res.status(404).json({ status: 404,message: data.message, data: {} });
     }));
     
    }
}
module.exports = VotingRoutes;