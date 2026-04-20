const mongoose = require('mongoose');
const moment = require('moment');
const gen = require('../../utils/GenKey');

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// WorkspaceFiles Schema
// Stores metadata for files uploaded into workspace folders.
// Allowed file types: pdf, docx
// Threshold: 10 MB per user
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const workspaceFileSchema = new mongoose.Schema({
    file_id: {
        type: String,
        required: true,
        unique: true,
        default: () => gen(14),
    },
    // Owner user uid
    uid: {
        type: String,
        required: true,
        trim: true,
    },
    // Parent folder — 'root' or a folder_id
    folder_id: {
        type: String,
        required: true,
        default: 'root',
    },
    // Original file name
    original_name: {
        type: String,
        required: true,
        trim: true,
    },
    // Name stored on disk  (namespaced: uid_timestamp_originalname)
    stored_name: {
        type: String,
        required: true,
    },
    // Relative path on the server (public URL segment)
    file_path: {
        type: String,
        required: true,
    },
    // MIME type
    mime_type: {
        type: String,
        required: true,
    },
    // File extension: 'pdf' | 'docx' | 'json'
    ext: {
        type: String,
        required: true,
        enum: ['pdf', 'docx', 'json'],
    },
    // True if this is a submitted content file (JSON text)
    is_content: {
        type: Boolean,
        default: false,
    },
    // For contents, a short raw text preview
    excerpt: {
        type: String,
        default: '',
    },
    // Size in bytes — used for storage quota calculation
    size_bytes: {
        type: Number,
        required: true,
        default: 0,
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

async function WorkspaceFileschema(db) {
    return db.model('WorkspaceFiles', workspaceFileSchema);
}

module.exports = WorkspaceFileschema;
