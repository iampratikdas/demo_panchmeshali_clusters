const { required } = require('joi');
const mongoose = require('mongoose');
const moment = require("moment");
const gen = require("../../utils/GenKey");

const noticeSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    // unique: true,
  },
  title:{
    type: String,
    required: true,
  },
  url:{
     type: String,
    required: false,
  },
  nid: {
     type: String,
    required: true,
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

async function Contentschema(db) {
  return db.model('Notice', noticeSchema)
}
module.exports = Contentschema;