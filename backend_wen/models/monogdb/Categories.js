const mongoose = require('mongoose');
const moment = require("moment");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  is_global: {
    type: Boolean,
    default: true
  },
  pid: { // Empty if global, otherwise holds publisher specific identifier
    type: String,
    default: ""
  },
  created_by: {
    type: String,
    required: true
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

async function Categoryschema(db) {
  return db.model('Categories', categorySchema);
}

module.exports = Categoryschema;
