const mongoose = require('mongoose');
const moment = require("moment");

const contentSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
  },

  token: {
    type: String,
  },

  type: {
    type: String,
  },

  name: {
    type: String,
  },

  storyName: {
    type: String,
  },

  author_name: {
    type: String,
  },

  status: {
    type: String,
    default: "Pending",
  },

  content: {
    type: String,
  },

  storyContent: {
    type: String,
  },

  marks: {
    type: Array,
  },

  url: {
    type: String,
  },

  eid: {
    type: String,
  },

  parent_id: {
    type: String,
    default: "",
  },

  h_title: {
    type: String,
    default: "",
  },

  event_content: {
    type: Boolean,
    default: false,
  },

  orgin_content: {
    type: Boolean,
    required: true,
  },

  isOriginalWork: {
    type: Boolean,
    default: false,
  },

  cont_id: {
    type: String,
    required: true,
    trim: true,
  },

  backgroundImage: {
    type: String,
    default: "",
  },

  coverImage: {
    type: String,
    default: "",
  },

  category: {
    type: String,
    default: "",
  },

  destination: {
    type: String,
    default: "app",
  },

  episodeNumber: {
    type: String,
    default: "",
  },

  publisher: {
    type: String,
    default: "",
  },

  wordCount: {
    type: Number,
    default: 0,
  },

  comments: {
    type: Array,
    default: [],
  },

  createdAt: {
    type: String,
    default: moment().unix(),
  },

  updatedAt: {
    type: String,
    default: moment().unix(),
  },
});

async function Contentschema(db) {
  return db.model('Contents', contentSchema);
}

module.exports = Contentschema;