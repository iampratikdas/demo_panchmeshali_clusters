const mongoose = require('mongoose');
const moment = require("moment");

const eventRequestSchema = new mongoose.Schema({
  eid: {
    type: String,
    required: true,
    trim: true
  },
  writer_uid: {
    type: String,
    required: true,
    trim: true
  },
  pid: {
    type: String, // publisher who created the event
    required: true,
    trim: true
  },
  parent_id: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Accepted'
  },
  createdAt: {
    type: String,
    default: () => moment().local().unix()
  },
  updatedAt: {
    type: String,
    default: () => moment().local().unix()
  }
});

async function EventRequestschema(db) {
  return db.model('EventRequests', eventRequestSchema);
}

module.exports = EventRequestschema;
