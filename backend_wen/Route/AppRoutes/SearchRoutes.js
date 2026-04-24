const passport = require('passport');
const { MethodValidate } = require("../../utils/Method_Check.js");
const initializes = require("../../resuable_functions/Initializer.js");

class SearchRoutes {
    Routes(router, searchController, modelFuncs, paginationFunc) {
        // Global API for Search List using the dedicated SearchController
        router.post("/search_list/:search_type",
            (req, res, next) => MethodValidate(req, res, next, "post"),
            async (req, res) => await initializes(req, res, modelFuncs)
                .then((token_data) => token_data && searchController.searchList(req, res, token_data, paginationFunc))
                .catch((error) => {
                    return res.status(404).json({ status: 404, message: error.message || "Failed to initialize", data: {} });
                })
        );
        router.get("/search_func_call/:page_name",
            (req, res, next) => MethodValidate(req, res, next, "get"),
            async (req, res) => await initializes(req, res, modelFuncs)
                .then((token_data) => token_data && searchController.searchFuncCall(req, res, token_data))
                .catch((error) => {
                    return res.status(404).json({ status: 404, message: error.message || "Failed to initialize", data: {} });
                })
        );
    }
}

module.exports = SearchRoutes;
