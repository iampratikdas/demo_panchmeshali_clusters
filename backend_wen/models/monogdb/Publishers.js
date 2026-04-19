const { required } = require('joi');
const mongoose = require('mongoose');
const moment = require("moment");
const publisherSchema = new mongoose.Schema({
  uids: {
    type: [String],
    required: true,
    unique: true
  },
  pid: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: ""
  },
  phone: {
    type: String,
    default: ""
  },
  logo_url: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    default: "Pending" // e.g. Pending, Active, Inactive
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

async function Publisherschema(db) {
  return db.model('Publishers', publisherSchema)
}
module.exports = Publisherschema;