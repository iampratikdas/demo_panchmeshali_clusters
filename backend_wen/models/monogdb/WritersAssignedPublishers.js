const mongoose = require('mongoose');
const moment = require("moment");

const writersAssignedPublishersSchema = new mongoose.Schema({
  publisher_uid: {
    type: String,
    required: true,
  },
  writer_uid: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled'],
    default: "Pending"
  },
  requested_by: {
    type: String,
    enum: ['publisher', 'writer'],
    required: true
  },
  createdAt: {
    type: String,
    default: moment().unix()
  },
  updatedAt: {
    type: String,
    default: moment().unix()
  }
});

async function WritersAssignedPublishersschema(db) {
  return db.model('WritersAssignedPublishers', writersAssignedPublishersSchema)
}
module.exports = WritersAssignedPublishersschema;
