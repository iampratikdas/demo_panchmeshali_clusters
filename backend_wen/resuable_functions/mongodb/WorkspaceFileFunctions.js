const moment = require('moment');
const WorkspaceFileschema = require('../../models/monogdb/WorkspaceFiles');
const Setup = require('../../db/mongodb/setupDatabase');

// 10 MB threshold (in bytes)
const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024;

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// WorkspaceFileFunctions - DB helper layer for WorkspaceFiles collection
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class WorkspaceFileFunctions {
    constructor() {
        (async () => {
            this.fileModel = await WorkspaceFileschema(await Setup.getConnection());
        })();
    }

    // ── Read ────────────────────────────────────────────────────────────────

    /** Return all non-deleted files in a given folder for a user */
    async findByFolder(uid, folder_id) {
        return await this.fileModel
            .find({ uid, folder_id, is_deleted: false })
            .sort({ createdAt: -1 })
            .lean();
    }

    /** Return all non-deleted files for a user (all folders) */
    async findAllByUser(uid) {
        return await this.fileModel
            .find({ uid, is_deleted: false })
            .lean();
    }

    /** Return a single file record */
    async findById(file_id) {
        return await this.fileModel.findOne({ file_id, is_deleted: false }).lean();
    }

    // ── Storage Quota ────────────────────────────────────────────────────────

    /**
     * Calculate total bytes used by a user across all workspace files.
     * Uses MongoDB aggregation for accuracy.
     */
    async getTotalUsedBytes(uid) {
        const result = await this.fileModel.aggregate([
            { $match: { uid, is_deleted: false } },
            { $group: { _id: null, totalBytes: { $sum: '$size_bytes' } } },
        ]);
        return result.length > 0 ? result[0].totalBytes : 0;
    }

    /**
     * Returns storage info object for a user:
     * { used_bytes, total_bytes, used_mb, total_mb, percentage, over_limit }
     */
    async getStorageInfo(uid) {
        const used_bytes = await this.getTotalUsedBytes(uid);
        const total_bytes = STORAGE_LIMIT_BYTES;
        const used_mb = parseFloat((used_bytes / (1024 * 1024)).toFixed(3));
        const total_mb = parseFloat((total_bytes / (1024 * 1024)).toFixed(3));
        const percentage = Math.min(Math.round((used_bytes / total_bytes) * 100), 100);
        const over_limit = used_bytes >= total_bytes;

        return { used_bytes, total_bytes, used_mb, total_mb, percentage, over_limit };
    }

    // ── Write ────────────────────────────────────────────────────────────────

    /** Insert a new file record */
    async insertFile(fileData) {
        try {
            return await this.fileModel.create(fileData);
        } catch (error) {
            console.error('Error inserting workspace file:', error);
            throw new Error('Failed to save file record');
        }
    }

    /** Soft-delete a file record */
    async deleteFile(file_id, uid) {
        try {
            return await this.fileModel.updateOne(
                { file_id, uid },
                { $set: { is_deleted: true, updatedAt: String(moment().unix()) } }
            );
        } catch (error) {
            console.error('Error deleting workspace file:', error);
            throw new Error('Failed to delete file record');
        }
    }
}

module.exports = WorkspaceFileFunctions;
