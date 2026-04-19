const { MethodValidate } = require('../../utils/Method_Check.js');
const initializes = require('../../resuable_functions/Initializer.js');

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// FolderRoutes
// All endpoints are restricted to roles: 'writer' | 'both'
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class FolderRoutes {
    async Routes(router, FolderController, userFunc) {

        // ────────────────────────────────────────────────────────────────────
        // POST /api/create_folder
        // Create a new folder (optionally nested under a parentId)
        // ────────────────────────────────────────────────────────────────────
        router.post(
            '/create_folder',
            (req, res, next) => MethodValidate(req, res, next, 'post'),
            async (req, res) =>
                await initializes(req, res, userFunc, ['writer', 'both'])
                    .then((token_data) => token_data && FolderController.createFolder(req, res, token_data))
                    .catch((data) =>
                        res.status(404).json({ status: 404, message: data.message, data: {} })
                    )
        );

        // ────────────────────────────────────────────────────────────────────
        // POST /api/rename_folder
        // Rename an existing folder by folder_id
        // ────────────────────────────────────────────────────────────────────
        router.post(
            '/rename_folder',
            (req, res, next) => MethodValidate(req, res, next, 'post'),
            async (req, res) =>
                await initializes(req, res, userFunc, ['writer', 'both'])
                    .then((token_data) => token_data && FolderController.renameFolder(req, res, token_data))
                    .catch((data) =>
                        res.status(404).json({ status: 404, message: data.message, data: {} })
                    )
        );

        // ────────────────────────────────────────────────────────────────────
        // POST /api/list_folders
        // List all user folders, or children of a specific parentId
        // Body: { parentId? }
        // ────────────────────────────────────────────────────────────────────
        router.post(
            '/list_folders',
            (req, res, next) => MethodValidate(req, res, next, 'post'),
            async (req, res) =>
                await initializes(req, res, userFunc, ['writer', 'both'])
                    .then((token_data) => token_data && FolderController.listFolders(req, res, token_data))
                    .catch((data) =>
                        res.status(404).json({ status: 404, message: data.message, data: {} })
                    )
        );

        // ────────────────────────────────────────────────────────────────────
        // POST /api/delete_folder
        // Soft-delete a folder by folder_id
        // ────────────────────────────────────────────────────────────────────
        router.post(
            '/delete_folder',
            (req, res, next) => MethodValidate(req, res, next, 'post'),
            async (req, res) =>
                await initializes(req, res, userFunc, ['writer', 'both'])
                    .then((token_data) => token_data && FolderController.deleteFolder(req, res, token_data))
                    .catch((data) =>
                        res.status(404).json({ status: 404, message: data.message, data: {} })
                    )
        );
    }
}

module.exports = FolderRoutes;
