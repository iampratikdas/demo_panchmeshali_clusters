const mongoose = require('mongoose');
const moment = require('moment');
const gen = require('../../utils/GenKey');

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Folder Schema
// Accessible by users with role: 'writer' or 'both'
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const folderSchema = new mongoose.Schema({
    folder_id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        default: () => gen(12),
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // uid of the user who owns this folder
    uid: {
        type: String,
        required: true,
        trim: true,
    },
    // 'root' means top-level; otherwise stores parent folder_id
    parentId: {
        type: String,
        default: 'root',
        trim: true,
    },
    color: {
        type: String,
        default: '#374151',
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: String,
        default: () => String(moment().unix()),
    },
    updatedAt: {
        type: String,
        default: () => String(moment().unix()),
    },
});

async function Folderschema(db) {
    return db.model('Folders', folderSchema);
}

module.exports = Folderschema;
