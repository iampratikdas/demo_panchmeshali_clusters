const moment = require('moment');
const Folderschema = require('../../models/monogdb/Folders');
const Setup = require('../../db/mongodb/setupDatabase');

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// FolderFunctions - DB helper layer for Folders collection
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
class FolderFunctions {
    constructor() {
        (async () => {
            this.folderModel = await Folderschema(await Setup.getConnection());
        })();
    }

    // ── Read ────────────────────────────────────────────────────────────────

    async findAllByUser(uid) {
        return await this.folderModel
            .find({ uid, is_deleted: false })
            .sort({ createdAt: 1 })
            .lean();
    }
    async folderCount(data) {
        return await this.folderModel.find({...data, is_deleted: false}).countDocuments().lean()
    }
    async folderListByData(data, skip = 0, limit = 0) {
        return await this.folderModel.find({...data, is_deleted: false}).skip(skip).limit(limit).sort({ createdAt: 1 }).lean()
    }

    /** Return a single folder by its folder_id */
    async findById(folder_id) {
        return await this.folderModel
            .findOne({ folder_id, is_deleted: false })
            .lean();
    }

    /** Return direct children of a given parent */
    async findChildren(uid, parentId) {
        return await this.folderModel
            .find({ uid, parentId, is_deleted: false })
            .sort({ createdAt: 1 })
            .lean();
    }

    // ── Write ───────────────────────────────────────────────────────────────

    /** Insert a new folder */
    async insertFolder(folderData) {
        try {
            return await this.folderModel.create(folderData);
        } catch (error) {
            console.error('Error inserting folder:', error);
            throw new Error('Failed to create folder');
        }
    }

    /** Rename an existing folder (only owner may rename) */
    async renameFolder(folder_id, uid, newName) {
        try {
            return await this.folderModel.updateOne(
                { folder_id, uid, is_deleted: false },
                { $set: { name: newName, updatedAt: String(moment().unix()) } }
            );
        } catch (error) {
            console.error('Error renaming folder:', error);
            throw new Error('Failed to rename folder');
        }
    }

    /** Soft-delete a folder */
    async deleteFolder(folder_id, uid) {
        try {
            return await this.folderModel.updateOne(
                { folder_id, uid },
                { $set: { is_deleted: true, updatedAt: String(moment().unix()) } }
            );
        } catch (error) {
            console.error('Error deleting folder:', error);
            throw new Error('Failed to delete folder');
        }
    }

    /** Check if a folder name already exists under the same parent for this user */
    async nameExists(uid, parentId, name) {
        const doc = await this.folderModel
            .findOne({ uid, parentId, name, is_deleted: false })
            .lean();
        return !!doc;
    }
}

module.exports = FolderFunctions;
