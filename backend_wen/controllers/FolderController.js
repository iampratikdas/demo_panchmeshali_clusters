const path = require('path');
const fs = require('fs');
const GenKey = require('../utils/GenKey');
const moment = require('moment');

// ─── Allowed extensions and MIME types ──────────────────────────────────────
const ALLOWED_EXTS = ['.pdf', '.docx'];
const ALLOWED_MIMES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// 10 MB storage threshold per user
const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024;

function resolveWorkspaceFilePath(stored_name) {
    const primary = path.join(__dirname, '../public/workspace', stored_name);
    if (fs.existsSync(primary)) return primary;
    const legacy = path.join(__dirname, '../../public/workspace', stored_name);
    if (fs.existsSync(legacy)) return legacy;
    return primary;
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// FolderController
// Handles: create, rename, list (navigate) folders
//          upload file, list files, delete file, get storage info
// Allowed roles: 'writer' | 'both'
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class FolderController {
    constructor(userFunc) {
        this.userFunc = userFunc;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // FOLDER OPERATIONS
    // ══════════════════════════════════════════════════════════════════════════

    // ────────────────────────────────────────────────────────────────────────
    // POST /api/create_folder   — Body: { name, parentId? }
    // ────────────────────────────────────────────────────────────────────────
    async createFolder(req, res, token_data) {
        try {
            const { name, parentId = 'root' } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({ status: 400, message: 'Folder name is required.', data: {} });
            }
            const trimmedName = name.trim();

            const duplicate = await this.userFunc.folderFunctions.nameExists(token_data.uid, parentId, trimmedName);
            if (duplicate) {
                return res.status(409).json({
                    status: 409,
                    message: `A folder named "${trimmedName}" already exists here.`,
                    data: {},
                });
            }

            if (parentId !== 'root') {
                const parentFolder = await this.userFunc.folderFunctions.findById(parentId);
                if (!parentFolder || parentFolder.uid !== token_data.uid) {
                    return res.status(404).json({ status: 404, message: 'Parent folder not found.', data: {} });
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
            return res.status(200).json({ status: 200, message: 'Folder created successfully.', data: result });
        } catch (error) {
            console.error('createFolder error:', error);
            return res.status(500).json({ status: 500, message: error.message || 'Internal server error.', data: {} });
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // POST /api/rename_folder   — Body: { folder_id, name }
    // ────────────────────────────────────────────────────────────────────────
    async renameFolder(req, res, token_data) {
        try {
            const { folder_id, name } = req.body;

            if (!folder_id || !name || !name.trim()) {
                return res.status(400).json({ status: 400, message: 'folder_id and a non-empty name are required.', data: {} });
            }
            const trimmedName = name.trim();

            const folder = await this.userFunc.folderFunctions.findById(folder_id);
            if (!folder) return res.status(404).json({ status: 404, message: 'Folder not found.', data: {} });
            if (folder.uid !== token_data.uid) return res.status(403).json({ status: 403, message: 'Forbidden.', data: {} });

            const duplicate = await this.userFunc.folderFunctions.nameExists(token_data.uid, folder.parentId, trimmedName);
            if (duplicate && folder.name !== trimmedName) {
                return res.status(409).json({ status: 409, message: `A folder named "${trimmedName}" already exists here.`, data: {} });
            }

            const result = await this.userFunc.folderFunctions.renameFolder(folder_id, token_data.uid, trimmedName);
            return res.status(200).json({ status: 200, message: 'Folder renamed successfully.', data: result });
        } catch (error) {
            console.error('renameFolder error:', error);
            return res.status(500).json({ status: 500, message: error.message || 'Internal server error.', data: {} });
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // POST /api/list_folders   — Body: { parentId? }
    // ────────────────────────────────────────────────────────────────────────
    async listFolders(req, res, token_data) {
        try {
            const { parentId = null } = req.body;
            let folders;

            if (parentId) {
                if (parentId !== 'root') {
                    const parentFolder = await this.userFunc.folderFunctions.findById(parentId);
                    if (!parentFolder || parentFolder.uid !== token_data.uid) {
                        return res.status(404).json({ status: 404, message: 'Parent folder not found.', data: [] });
                    }
                }
                folders = await this.userFunc.folderFunctions.findChildren(token_data.uid, parentId);
            } else {
                folders = await this.userFunc.folderFunctions.findAllByUser(token_data.uid);
            }

            return res.status(200).json({ status: 200, message: 'Folders fetched successfully.', data: folders });
        } catch (error) {
            console.error('listFolders error:', error);
            return res.status(500).json({ status: 500, message: error.message || 'Internal server error.', data: [] });
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // POST /api/delete_folder   — Body: { folder_id }
    // ────────────────────────────────────────────────────────────────────────
    async deleteFolder(req, res, token_data) {
        try {
            const { folder_id } = req.body;
            if (!folder_id) return res.status(400).json({ status: 400, message: 'folder_id is required.', data: {} });

            const folder = await this.userFunc.folderFunctions.findById(folder_id);
            if (!folder) return res.status(404).json({ status: 404, message: 'Folder not found.', data: {} });
            if (folder.uid !== token_data.uid) return res.status(403).json({ status: 403, message: 'Forbidden.', data: {} });

            await this.userFunc.folderFunctions.deleteFolder(folder_id, token_data.uid);
            return res.status(200).json({ status: 200, message: 'Folder deleted successfully.', data: {} });
        } catch (error) {
            console.error('deleteFolder error:', error);
            return res.status(500).json({ status: 500, message: error.message || 'Internal server error.', data: {} });
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // FILE UPLOAD OPERATIONS
    // ══════════════════════════════════════════════════════════════════════════

    // ────────────────────────────────────────────────────────────────────────
    // POST /api/workspace_upload_file   — multipart/form-data
    //   Fields: folder_id (optional, default 'root')
    //   File:   file (single, .pdf or .docx only)
    // ────────────────────────────────────────────────────────────────────────
    async uploadFile(req, res, token_data) {
        try {
            // Multer attaches file to req.file
            if (!req.file) {
                return res.status(400).json({ status: 400, message: 'No file uploaded. Please attach a PDF or DOCX file.', data: {} });
            }

            const uploadedFile = req.file;
            const ext = path.extname(uploadedFile.originalname).toLowerCase();

            // Double-check extension (multer already filters by mimetype, this is an extra guard)
            if (!ALLOWED_EXTS.includes(ext)) {
                // Remove the uploaded temp file
                fs.unlink(uploadedFile.path, () => {});
                return res.status(400).json({ status: 400, message: 'Only PDF and DOCX files are allowed.', data: {} });
            }

            const folder_id = req.body.folder_id || 'root';

            // Validate folder ownership (if not root)
            if (folder_id !== 'root') {
                const folder = await this.userFunc.folderFunctions.findById(folder_id);
                if (!folder || folder.uid !== token_data.uid) {
                    fs.unlink(uploadedFile.path, () => {});
                    return res.status(404).json({ status: 404, message: 'Target folder not found.', data: {} });
                }
            }

            const fileSize = uploadedFile.size;

            // ── Storage quota check ─────────────────────────────────────────
            const storageInfo = await this.userFunc.workspaceFileFunctions.getStorageInfo(token_data.uid);
            const projectedUsed = storageInfo.used_bytes + fileSize;

            if (projectedUsed > STORAGE_LIMIT_BYTES) {
                // Remove the temp uploaded file
                fs.unlink(uploadedFile.path, () => {});
                return res.status(402).json({
                    status: 402,
                    message: 'You have to pay',
                    exceeded: true,
                    storage: {
                        used_mb: storageInfo.used_mb,
                        total_mb: storageInfo.total_mb,
                        percentage: storageInfo.percentage,
                    },
                    data: {},
                });
            }

            // ── Save file record ────────────────────────────────────────────
            const fileRecord = {
                file_id: GenKey(14),
                uid: token_data.uid,
                folder_id,
                original_name: uploadedFile.originalname,
                stored_name: uploadedFile.filename,
                // Build a public-accessible relative URL  e.g. /public/workspace/filename
                file_path: `/public/workspace/${uploadedFile.filename}`,
                mime_type: uploadedFile.mimetype,
                ext: ext.replace('.', ''), // 'pdf' or 'docx'
                size_bytes: fileSize,
                createdAt: String(moment().unix()),
                updatedAt: String(moment().unix()),
            };

            const saved = await this.userFunc.workspaceFileFunctions.insertFile(fileRecord);

            // Return updated storage alongside saved record
            const updatedStorage = await this.userFunc.workspaceFileFunctions.getStorageInfo(token_data.uid);

            return res.status(200).json({
                status: 200,
                message: 'File uploaded successfully.',
                data: saved,
                storage: updatedStorage,
            });
        } catch (error) {
            // Cleanup if something failed after multer wrote the file
            if (req.file) fs.unlink(req.file.path, () => {});
            console.error('uploadFile error:', error);
            return res.status(500).json({ status: 500, message: error.message || 'Internal server error.', data: {} });
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // POST /api/workspace_list_files   — Body: { folder_id? }
    // ────────────────────────────────────────────────────────────────────────
    async listFiles(req, res, token_data) {
        try {
            const { folder_id = 'root' } = req.body;
            const files = await this.userFunc.workspaceFileFunctions.findByFolder(token_data.uid, folder_id);
            return res.status(200).json({ status: 200, message: 'Files fetched successfully.', data: files });
        } catch (error) {
            console.error('listFiles error:', error);
            return res.status(500).json({ status: 500, message: error.message || 'Internal server error.', data: [] });
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // POST /api/workspace_delete_file   — Body: { file_id }
    // ────────────────────────────────────────────────────────────────────────
    async deleteFile(req, res, token_data) {
        try {
            const { file_id } = req.body;
            if (!file_id) return res.status(400).json({ status: 400, message: 'file_id is required.', data: {} });

            const fileRecord = await this.userFunc.workspaceFileFunctions.findById(file_id);
            if (!fileRecord) return res.status(404).json({ status: 404, message: 'File not found.', data: {} });
            if (fileRecord.uid !== token_data.uid) return res.status(403).json({ status: 403, message: 'Forbidden.', data: {} });

            // Soft-delete record
            await this.userFunc.workspaceFileFunctions.deleteFile(file_id, token_data.uid);

            // Optionally: remove physical file from disk
            const physicalPath = path.join(__dirname, '..', 'public', 'workspace', fileRecord.stored_name);
            fs.unlink(physicalPath, () => {}); // fire-and-forget

            const updatedStorage = await this.userFunc.workspaceFileFunctions.getStorageInfo(token_data.uid);

            return res.status(200).json({
                status: 200,
                message: 'File deleted successfully.',
                data: {},
                storage: updatedStorage,
            });
        } catch (error) {
            console.error('deleteFile error:', error);
            return res.status(500).json({ status: 500, message: error.message || 'Internal server error.', data: {} });
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // POST /api/workspace_update_content   — Body: { file_id, title, content }
    // ────────────────────────────────────────────────────────────────────────
    async updateContent(req, res, token_data) {
        try {
            const { file_id, title, content } = req.body;
            if (!file_id) return res.status(400).json({ status: 400, message: 'file_id is required.', data: {} });

            const fileRecord = await this.userFunc.workspaceFileFunctions.findById(file_id);
            if (!fileRecord) return res.status(404).json({ status: 404, message: 'File not found.', data: {} });
            if (fileRecord.uid !== token_data.uid) return res.status(403).json({ status: 403, message: 'Forbidden.', data: {} });
            if (fileRecord.ext !== 'json') return res.status(400).json({ status: 400, message: 'Not a JSON content file.', data: {} });

            const jsonData = Buffer.from(JSON.stringify({ title, content }));
            const newSize = jsonData.length;
            const sizeDiff = newSize - fileRecord.size_bytes;

            // Optional: check quota if size increased
            if (sizeDiff > 0) {
                const storageInfo = await this.userFunc.workspaceFileFunctions.getStorageInfo(token_data.uid);
                if (storageInfo.used_bytes + sizeDiff > STORAGE_LIMIT_BYTES) {
                    return res.status(402).json({
                        status: 402,
                        message: 'Storage full. You have to pay to continue saving files.',
                        exceeded: true,
                    });
                }
            }

            // Write to physical file
            const physicalPath = resolveWorkspaceFilePath(fileRecord.stored_name);
            fs.writeFileSync(physicalPath, jsonData);

            // Update db record
            const rawText = content ? content.replace(/<[^>]+>/g, '').substring(0, 150) : '';
            await this.userFunc.workspaceFileFunctions.updateFile(file_id, token_data.uid, {
                size_bytes: newSize,
                excerpt: rawText,
                original_name: title || fileRecord.original_name,
                updatedAt: String(moment().unix())
            });

            return res.status(200).json({
                status: 200,
                message: 'Content updated successfully.',
                data: {}
            });
        } catch (error) {
            console.error('updateContent error:', error);
            return res.status(500).json({ status: 500, message: error.message || 'Internal server error.', data: {} });
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // POST /api/workspace_get_content   — Body: { file_id }
    // Returns { title, content } from the JSON workspace file
    // ────────────────────────────────────────────────────────────────────────
    async getContent(req, res, token_data) {
        try {
            const { file_id } = req.body;
            if (!file_id) return res.status(400).json({ status: 400, message: 'file_id is required.', data: {} });

            const fileRecord = await this.userFunc.workspaceFileFunctions.findById(file_id);
            if (!fileRecord) return res.status(404).json({ status: 404, message: 'File not found.', data: {} });
            if (fileRecord.uid !== token_data.uid) return res.status(403).json({ status: 403, message: 'Forbidden.', data: {} });
            if (fileRecord.ext !== 'json') return res.status(400).json({ status: 400, message: 'Not a JSON content file.', data: {} });

            const physicalPath = resolveWorkspaceFilePath(fileRecord.stored_name);
            if (!fs.existsSync(physicalPath)) {
                return res.status(404).json({ status: 404, message: 'Content file not found on disk.', data: {} });
            }

            const raw = fs.readFileSync(physicalPath, 'utf8');
            const parsed = JSON.parse(raw);

            return res.status(200).json({
                status: 200,
                message: 'Content fetched.',
                data: {
                    title: parsed.title ?? fileRecord.original_name,
                    content: parsed.content ?? '',
                },
            });
        } catch (error) {
            console.error('getContent error:', error);
            return res.status(500).json({ status: 500, message: error.message || 'Internal server error.', data: {} });
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // GET /api/workspace_storage   — No body needed
    // Returns the user's current storage usage calculated from DB documents
    // ────────────────────────────────────────────────────────────────────────
    async getStorageInfo(req, res, token_data) {
        try {
            const info = await this.userFunc.workspaceFileFunctions.getStorageInfo(token_data.uid);
            return res.status(200).json({
                status: 200,
                message: 'Storage info fetched.',
                data: info,
            });
        } catch (error) {
            console.error('getStorageInfo error:', error);
            return res.status(500).json({ status: 500, message: error.message || 'Internal server error.', data: {} });
        }
    }
}

module.exports = FolderController;
