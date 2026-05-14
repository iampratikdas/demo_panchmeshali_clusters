const mongoose = require('mongoose');
const moment = require("moment");

// Stores aggregated stats for writers — followers, ratings, etc.
const writerStatsSchema = new mongoose.Schema({
  writer_uid: {
    type: String,
    required: true,
    unique: true,
  },
  followers_count: {
    type: Number,
    default: 0
  },
  average_rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  total_ratings: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    default: ""
  },
  genre_specialization: {
    type: [String],
    default: []
  },
  activity_status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active'
  },
  createdAt: {
    type: String,
    default: () => moment().unix().toString()
  },
  updatedAt: {
    type: String,
    default: () => moment().unix().toString()
  }
});

async function WriterStatsschema(db) {
  return db.model('WriterStats', writerStatsSchema);
}
module.exports = WriterStatsschema;
