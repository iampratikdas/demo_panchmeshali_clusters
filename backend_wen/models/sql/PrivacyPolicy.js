//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Import Dependencies
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const mongoose = require('mongoose');
const moment = require('moment');

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Define Schema
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const PrivacyPolicySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Number,
    default: () => moment().unix()
  },
  updated_at: {
    type: Number,
    default: () => moment().unix()
  }
}, {
  collection: 'privacy_policy',
  timestamps: false // Not using Mongoose's timestamps; using custom fields
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Export Model
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const PrivacyPolicy = mongoose.model('PrivacyPolicy', PrivacyPolicySchema);
module.exports = { PrivacyPolicy };
