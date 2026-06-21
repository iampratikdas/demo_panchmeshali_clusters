const mongoose = require('mongoose');
const moment = require('moment');

const proofReadSchema = new mongoose.Schema({
  cont_id: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  eid: {
    type: String,
    required: true,
    trim: true,
  },
  pid: {
    type: String,
    default: '',
    trim: true,
  },
  pr: {
    type: Boolean,
    default: false,
  },
  marked_by: {
    type: String,
    default: '',
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

async function ProofReadschema(db) {
  return db.model('ProofReads', proofReadSchema);
}

module.exports = ProofReadschema;
