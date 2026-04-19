const GenKey = require('../utils/GenKey');
const moment = require('moment');

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// FolderController
// Handles: create, rename, list (navigate) folders
// Allowed roles: 'writer' | 'both'
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class FolderController {
    constructor(userFunc) {
        this.userFunc = userFunc;
    }

    // ────────────────────────────────────────────────────────────────────────
    // POST /api/create_folder
    // Body: { name, parentId? }
    // ────────────────────────────────────────────────────────────────────────
    async createFolder(req, res, token_data) {
        try {
            const { name, parentId = 'root' } = req.body;

            // Validation
            if (!name || !name.trim()) {
                return res.status(400).json({
                    status: 400,
                    message: 'Folder name is required.',
                    data: {},
                });
            }
            const trimmedName = name.trim();

            // Check for duplicate name under same parent
            const duplicate = await this.userFunc.folderFunctions.nameExists(
                token_data.uid,
                parentId,
                trimmedName
            );
            if (duplicate) {
                return res.status(409).json({
                    status: 409,
                    message: `A folder named "${trimmedName}" already exists here.`,
                    data: {},
                });
            }

            // If parentId is not 'root', verify the parent exists and belongs to the user
            if (parentId !== 'root') {
                const parentFolder = await this.userFunc.folderFunctions.findById(parentId);
                if (!parentFolder || parentFolder.uid !== token_data.uid) {
                    return res.status(404).json({
                        status: 404,
                        message: 'Parent folder not found.',
                        data: {},
                    });
                }
            }

            const newFolder = {
                folder_id: GenKey(12),
                name: trimmedName,
                uid: token_data.uid,
                parentId,
                color: '#374151',
                createdAt: String(moment().unix()),
                updatedAt: String(moment().unix()),
            };

            const result = await this.userFunc.folderFunctions.insertFolder(newFolder);

            return res.status(200).json({
                status: 200,
                message: 'Folder created successfully.',
                data: result,
            });
        } catch (error) {
            console.error('createFolder error:', error);
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error.',
                data: {},
            });
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // POST /api/rename_folder
    // Body: { folder_id, name }
    // ────────────────────────────────────────────────────────────────────────
    async renameFolder(req, res, token_data) {
        try {
            const { folder_id, name } = req.body;

            if (!folder_id || !name || !name.trim()) {
                return res.status(400).json({
                    status: 400,
                    message: 'folder_id and a non-empty name are required.',
                    data: {},
                });
            }
            const trimmedName = name.trim();

            // Ownership check
            const folder = await this.userFunc.folderFunctions.findById(folder_id);
            if (!folder) {
                return res.status(404).json({
                    status: 404,
                    message: 'Folder not found.',
                    data: {},
                });
            }
            if (folder.uid !== token_data.uid) {
                return res.status(403).json({
                    status: 403,
                    message: 'Forbidden. You do not own this folder.',
                    data: {},
                });
            }

            // Duplicate name check inside the same parent
            const duplicate = await this.userFunc.folderFunctions.nameExists(
                token_data.uid,
                folder.parentId,
                trimmedName
            );
            if (duplicate && folder.name !== trimmedName) {
                return res.status(409).json({
                    status: 409,
                    message: `A folder named "${trimmedName}" already exists here.`,
                    data: {},
                });
            }

            const result = await this.userFunc.folderFunctions.renameFolder(
                folder_id,
                token_data.uid,
                trimmedName
            );

            return res.status(200).json({
                status: 200,
                message: 'Folder renamed successfully.',
                data: result,
            });
        } catch (error) {
            console.error('renameFolder error:', error);
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error.',
                data: {},
            });
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // POST /api/list_folders
    // Body: { parentId? }   — omit or pass 'root' to list top-level folders
    // ────────────────────────────────────────────────────────────────────────
    async listFolders(req, res, token_data) {
        try {
            const { parentId = null } = req.body;

            let folders;
            if (parentId) {
                // If navigating into a specific parent, verify ownership
                if (parentId !== 'root') {
                    const parentFolder = await this.userFunc.folderFunctions.findById(parentId);
                    if (!parentFolder || parentFolder.uid !== token_data.uid) {
                        return res.status(404).json({
                            status: 404,
                            message: 'Parent folder not found.',
                            data: [],
                        });
                    }
                }
                folders = await this.userFunc.folderFunctions.findChildren(
                    token_data.uid,
                    parentId
                );
            } else {
                // Return ALL folders for the user (the frontend can tree-build client-side)
                folders = await this.userFunc.folderFunctions.findAllByUser(token_data.uid);
            }

            return res.status(200).json({
                status: 200,
                message: 'Folders fetched successfully.',
                data: folders,
            });
        } catch (error) {
            console.error('listFolders error:', error);
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error.',
                data: [],
            });
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // POST /api/delete_folder
    // Body: { folder_id }
    // ────────────────────────────────────────────────────────────────────────
    async deleteFolder(req, res, token_data) {
        try {
            const { folder_id } = req.body;

            if (!folder_id) {
                return res.status(400).json({
                    status: 400,
                    message: 'folder_id is required.',
                    data: {},
                });
            }

            const folder = await this.userFunc.folderFunctions.findById(folder_id);
            if (!folder) {
                return res.status(404).json({
                    status: 404,
                    message: 'Folder not found.',
                    data: {},
                });
            }
            if (folder.uid !== token_data.uid) {
                return res.status(403).json({
                    status: 403,
                    message: 'Forbidden. You do not own this folder.',
                    data: {},
                });
            }

            await this.userFunc.folderFunctions.deleteFolder(folder_id, token_data.uid);

            return res.status(200).json({
                status: 200,
                message: 'Folder deleted successfully.',
                data: {},
            });
        } catch (error) {
            console.error('deleteFolder error:', error);
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error.',
                data: {},
            });
        }
    }
}

module.exports = FolderController;
