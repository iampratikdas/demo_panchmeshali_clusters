class SearchController {
  constructor(modelFuncs) {
    this.modelFuncs = modelFuncs;
  }

  async searchList(req, res, token_data, paginationFunc) {
    try {
      console.log("paginationFunc", paginationFunc)
      let paginationObj = paginationFunc.pagination(req);
      const { skip, limit, page } = paginationObj;
      let listCounts = 0;
      let data = [];
      const searchType = req.params.search_type;
      const filter = req.body.filter || {};




      switch (searchType) {
        case "admin_search_users":
          listCounts = await this.modelFuncs.usersFunctions.userCount(filter);
          data = await this.modelFuncs.usersFunctions.userListByData(filter, skip, limit);
          break;
        case "admin_search_contentlist":
          listCounts = await this.modelFuncs.contentFunctions.contentCount(filter);
          data = await this.modelFuncs.contentFunctions.contentListByData(filter, skip, limit);
          break;
        case "admin_search_eventlist":
          listCounts = await this.modelFuncs.eventFunctions.eventCount(filter);
          data = await this.modelFuncs.eventFunctions.eventListByData(filter, skip, limit);
          break;
        case "admin_search_publisherlist":
          listCounts = await this.modelFuncs.publisherFunctions.publisherCount(filter);
          data = await this.modelFuncs.publisherFunctions.publisherListByData(filter, skip, limit);
          break;
        case "admin_search_folderlist":
          listCounts = await this.modelFuncs.folderFunctions.folderCount(filter);
          data = await this.modelFuncs.folderFunctions.folderListByData(filter, skip, limit);
          break;
        case "admin_search_votinglist":
          listCounts = await this.modelFuncs.voteFunctions.voteCount(filter);
          data = await this.modelFuncs.voteFunctions.voteListByData(filter, skip, limit);
          break;
        default:
          return res.status(400).json({ status: 400, message: "Invalid search type", data: {} });
      }

      const totalPages = Math.ceil(listCounts / limit);

      return res.status(201).json({
        status: 201,
        message: `${searchType} list fetched`,
        data: data,
        pagination: {
          listCounts,
          totalPages,
          currentPage: page,
          pageSize: limit,
          next: data.length === 0 ? false : (page >= totalPages ? false : true)
        }
      });
    } catch (error) {
      console.error("Error during searchList:", error);
      res.status(500).json({ status: 500, message: "Internal server error", data: {} });
    }
  }
  async searchFuncCall(req, res, token_data) {
    try {
      const page_name = req.params.page_name;
      switch (page_name) {
        case "users_management":
          if (token_data.role === "admin") {
            res.status(200).json({ status: 200, message: "fetched user management", data: `admin_search_users` });
          }
          break;
        default:
          return res.status(400).json({ status: 400, message: "Invalid page name", data: {} });
      }

    } catch (error) {
      console.error("Error during searchFuncCall:", error);
      res.status(500).json({ status: 500, message: "Internal server error", data: {} });
    }
  }
}

module.exports = SearchController;
