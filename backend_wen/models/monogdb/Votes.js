const { required } = require('joi');
const mongoose = require('mongoose');
const moment = require("moment");
const gen = require("../../utils/GenKey");

const contentSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    // unique: true,
  },
  cont_id: {
    type: String,
    required: true,
    // trim: true
  },
  eid: {
    type: String,
    // required: true,
    // trim: true
  },
  vid: {
    type: String,
    required: true,
    unique: true,
    default: gen(10),
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
  return db.model('Votes', contentSchema)
}
module.exports = Contentschema;