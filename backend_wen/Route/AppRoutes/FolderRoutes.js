const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { MethodValidate } = require('../../utils/Method_Check.js');
const initializes = require('../../resuable_functions/Initializer.js');

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Multer configuration — PDF and DOCX only, saved to public/workspace/
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const WORKSPACE_UPLOAD_DIR = path.join(__dirname, '../../public/workspace');

// Ensure the upload directory exists at startup
if (!fs.existsSync(WORKSPACE_UPLOAD_DIR)) {
    fs.mkdirSync(WORKSPACE_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, WORKSPACE_UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (_req, file, cb) => {
    const allowedMimes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only PDF and DOCX files are allowed.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // hard cap: single file ≤ 10 MB
    },
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// FolderRoutes
// All endpoints restricted to roles: 'writer' | 'both'
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class FolderRoutes {
    async Routes(router, FolderController, userFunc) {

        // ────────────────────────────────────────────────────────────────────
        // FOLDER ENDPOINTS
        // ────────────────────────────────────────────────────────────────────

        router.post(
            '/create_folder',
            (req, res, next) => MethodValidate(req, res, next, 'post'),
            async (req, res) =>
                await initializes(req, res, userFunc, ['writer', 'both'])
                    .then((token_data) => token_data && FolderController.createFolder(req, res, token_data))
                    .catch((data) => res.status(404).json({ status: 404, message: data.message, data: {} }))
        );

        router.post(
            '/rename_folder',
            (req, res, next) => MethodValidate(req, res, next, 'post'),
            async (req, res) =>
                await initializes(req, res, userFunc, ['writer', 'both'])
                    .then((token_data) => token_data && FolderController.renameFolder(req, res, token_data))
                    .catch((data) => res.status(404).json({ status: 404, message: data.message, data: {} }))
        );

        router.post(
            '/list_folders',
            (req, res, next) => MethodValidate(req, res, next, 'post'),
            async (req, res) =>
                await initializes(req, res, userFunc, ['writer', 'both'])
                    .then((token_data) => token_data && FolderController.listFolders(req, res, token_data))
                    .catch((data) => res.status(404).json({ status: 404, message: data.message, data: {} }))
        );

        router.post(
            '/delete_folder',
            (req, res, next) => MethodValidate(req, res, next, 'post'),
            async (req, res) =>
                await initializes(req, res, userFunc, ['writer', 'both'])
                    .then((token_data) => token_data && FolderController.deleteFolder(req, res, token_data))
                    .catch((data) => res.status(404).json({ status: 404, message: data.message, data: {} }))
        );

        // ────────────────────────────────────────────────────────────────────
        // FILE ENDPOINTS
        // ────────────────────────────────────────────────────────────────────

        /**
         * POST /api/workspace_upload_file
         * multipart/form-data
         *   - file: (binary) .pdf or .docx
         *   - folder_id: (text) optional, default 'root'
         */
        router.post(
            '/workspace_upload_file',
            // NOTE: multer MUST run before MethodValidate here (it reads multipart)
            upload.single('file'),
            // Handle multer errors gracefully
            (err, req, res, next) => {
                if (err instanceof multer.MulterError || err) {
                    return res.status(400).json({
                        status: 400,
                        message: err.message || 'File upload error.',
                        data: {},
                    });
                }
                next();
            },
            async (req, res) =>
                await initializes(req, res, userFunc, ['writer', 'both'])
                    .then((token_data) => token_data && FolderController.uploadFile(req, res, token_data))
                    .catch((data) => res.status(404).json({ status: 404, message: data.message, data: {} }))
        );

        /**
         * POST /api/workspace_list_files
         * Body: { folder_id? }
         */
        router.post(
            '/workspace_list_files',
            (req, res, next) => MethodValidate(req, res, next, 'post'),
            async (req, res) =>
                await initializes(req, res, userFunc, ['writer', 'both'])
                    .then((token_data) => token_data && FolderController.listFiles(req, res, token_data))
                    .catch((data) => res.status(404).json({ status: 404, message: data.message, data: {} }))
        );

        /**
         * POST /api/workspace_delete_file
         * Body: { file_id }
         */
        router.post(
            '/workspace_delete_file',
            (req, res, next) => MethodValidate(req, res, next, 'post'),
            async (req, res) =>
                await initializes(req, res, userFunc, ['writer', 'both'])
                    .then((token_data) => token_data && FolderController.deleteFile(req, res, token_data))
                    .catch((data) => res.status(404).json({ status: 404, message: data.message, data: {} }))
        );

        /**
         * POST /api/workspace_update_content
         * Body: { file_id, title, content }
         */
        router.post(
            '/workspace_update_content',
            (req, res, next) => MethodValidate(req, res, next, 'post'),
            async (req, res) =>
                await initializes(req, res, userFunc, ['writer', 'both'])
                    .then((token_data) => token_data && FolderController.updateContent(req, res, token_data))
                    .catch((data) => res.status(404).json({ status: 404, message: data.message, data: {} }))
        );

        /**
         * GET /api/workspace_storage
         * Returns current storage usage calculated from MongoDB documents
         */
        router.get(
            '/workspace_storage',
            (req, res, next) => MethodValidate(req, res, next, 'get'),
            async (req, res) =>
                await initializes(req, res, userFunc, ['writer', 'both'])
                    .then((token_data) => token_data && FolderController.getStorageInfo(req, res, token_data))
                    .catch((data) => res.status(404).json({ status: 404, message: data.message, data: {} }))
        );
    }
}

module.exports = FolderRoutes;
