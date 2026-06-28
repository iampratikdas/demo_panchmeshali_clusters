const { required } = require('joi');
const mongoose = require('mongoose');
const moment = require("moment");

const eventSchema = new mongoose.Schema({
  eid: {
    type: String,
    required: true,
    trim: true
  },
  logo_url: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  paid: {
    type: Boolean,
    default: false
  },
  paid_amt: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  },
  competition: {
    type: Boolean,
    default: false
  },
  is_social_media: {
    type: Boolean,
    default: false
  },
  pid: {
    type: String,
    required: true,
    trim: true
  },
  default_folder: {
    type: String,
    trim: true
  },
  is_book: {
    type: Boolean,
    default: false
  },
  is_app: {
    type: Boolean,
    default: false
  },

  event_type: {
    type: String,
    enum: [
      'Novel',
      'Novella / Short novel',
      'Essay / Article',
      'Story',
      'Long story',
      'Short story',
      'Micro story',
      'Nano story / Ultra-short story',
      'Dramatic story',
      'Verse',
      'Rhyme / Rhyming poem',
      'Poem',
      'Prose poem',
      'Haiku',
      'Limerick',
      'Movie',
      'Web Series',
      'Short-stories'
    ]
  },
  episode_wise: {
    type: Boolean,
    default: false
  },
  multiple_content: {
    type: Boolean,
    default: true,
  },
  active: {
    type: Boolean
  },
  created_by: {
    type: String
  },
  team: {
    type: Array, // team participating in that events
  },
  st_dt: {
    type: String, // start date of events
    default: moment().local().unix()
  },
  sh_list: {
    type: Number // number of short listing candidates on that events
  },
  en_dt: {
    type: String, // end date of events
    default: moment().local().unix()
  },
  parent: {
    type: String,
  },
  w_count: {
    type: Number // word count in that events
  },
  categories: {
    type: Array,
  },
  createdAt: {
    type: String,
    default: moment().local().unix()
  },
  updatedAt: {
    type: String,
    default: moment().local().unix()
  }
});

async function Eventschema(db) {
  return db.model('Events', eventSchema)
}
module.exports = Eventschema;