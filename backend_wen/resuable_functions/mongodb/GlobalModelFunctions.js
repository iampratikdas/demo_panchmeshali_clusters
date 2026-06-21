const UserFunctions = require("../mongodb/UserFunctions");
const ContentFunctions = require("../mongodb/ContentFunctions")
const VoteFunctions = require("../mongodb/VoteFunctions")
const EventFunctions = require("../mongodb/EventFunctions");
const NoticeFunctions = require("../mongodb/NoticeFunctions")
const PublisherFunctions = require("./PublishersFunctions")
const FolderFunctions = require("./FolderFunctions")
const WorkspaceFileFunctions = require("./WorkspaceFileFunctions")
const WriterStatsFunctions = require("./WriterStatsFunctions")
const ProofReadFunctions = require("./ProofReadFunctions")
class GlobalModelFunctions {
        modelsFunctions() {

                return {
                        usersFunctions: new UserFunctions(),
                        contentFunctions: new ContentFunctions(),
                        voteFunctions: new VoteFunctions(),
                        eventFunctions: new EventFunctions(),
                        noticeFunctions: new NoticeFunctions(),
                        publisherFunctions: new PublisherFunctions(),
                        folderFunctions: new FolderFunctions(),
                        workspaceFileFunctions: new WorkspaceFileFunctions(),
                        writerStatsFunctions: new WriterStatsFunctions(),
                        proofReadFunctions: new ProofReadFunctions(),
                        // pagination: pagination()
                };
        }
        pagination(req) {
                // if (req) {
                let page = parseInt(req.query.page) || 1;          // default page 1
                let limit = parseInt(req.query.limit) || 100;       // default 10 per page
                if (page < 1) page = 1;
                if (limit < 1) limit = 10;
                const skip = (page - 1) * limit;
                return {
                        skip, limit, page
                }
                // } else {
                //         return {
                //                 skip: 0, limit: 0, page: 0
                //         }
                // }
        }

}
module.exports = new GlobalModelFunctions;