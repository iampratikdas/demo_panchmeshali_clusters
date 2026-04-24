const express = require("express");
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//User App Controller
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const UserController = require("../controllers/UserController.js");
const ContentController = require("../controllers/ContentController.js");
const VotingController = require("../controllers/VotingController.js");
const EventController = require("../controllers/EventController.js");
const PublisherController = require("../controllers/PublisherController.js");
const FolderController = require("../controllers/FolderController.js");
const SearchController = require("../controllers/SearchController.js");

const User = require("./AppRoutes/User.js")
const Content = require("./AppRoutes/ContentRoutes.js")
const Voting = require("./AppRoutes/VotingRoutes.js");
const Events = require("./AppRoutes/EventRoutes.js")
const Publisher = require("./AppRoutes/PublisherRoutes.js")
const Folder = require("./AppRoutes/FolderRoutes.js")
const Search = require("./AppRoutes/SearchRoutes.js")
const GlobalModelFunctions = require("../resuable_functions/mongodb/GlobalModelFunctions.js")

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class Route {
    constructor() {
        // this.newres= res;
        this.userFunc = GlobalModelFunctions.modelsFunctions();
        this.paginationFunc = GlobalModelFunctions;
        this.router = express.Router();
        this.initializeRoutes();
    }
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    async initializeRoutes() {
        // ++++++ App Route Functions +++++++++++
        this.initializeUserRoutes(new UserController(this.userFunc)); //user routes initializer
        this.initializeContentRoutes(new ContentController(this.userFunc));  //content routes initializer
        this.initializeVotingRoutes(new VotingController(this.userFunc));  //voting routes initializer
        this.initializeEventsRoutes(new EventController(this.userFunc));  //event routes initializer
        this.initializePublisherRoutes(new PublisherController(this.userFunc));  //publisher routes initializer
        this.initializeFolderRoutes(new FolderController(this.userFunc));  //folder routes initializer
        this.initializeSearchRoutes(new SearchController(this.userFunc));  //search routes initializer
    }

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //This Route is for User Controller
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    initializeUserRoutes(userController) {
        new User().Routes(this.router, userController, this.userFunc, this.paginationFunc)
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //This Route is for Content Controller
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    initializeContentRoutes(contentController) {
        new Content().Routes(this.router, contentController, this.userFunc)
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //This Route is for Voting Controller
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    initializeVotingRoutes(votingController) {
        new Voting().Routes(this.router, votingController, this.userFunc)
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //This Route is for Events Controller
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    initializeEventsRoutes(eventController) {
        new Events().Routes(this.router, eventController, this.userFunc)
    }
    //This Route is for Publisher Controller
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    initializePublisherRoutes(publisherController) {
        new Publisher().Routes(this.router, publisherController, this.userFunc)
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //This Route is for Folder Controller
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    initializeFolderRoutes(folderController) {
        new Folder().Routes(this.router, folderController, this.userFunc)
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //This Route is for Search Controller
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    initializeSearchRoutes(searchController) {
        new Search().Routes(this.router, searchController, this.userFunc, this.paginationFunc)
    }

}
module.exports = Route;