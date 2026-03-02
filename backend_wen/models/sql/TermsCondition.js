//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Import Dependencies
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const mongoose = require('mongoose');

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Define Schema
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const TermsConditionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String, // Mongoose `String` supports long text
    required: true
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  collection: 'termsconditions',
  timestamps: true // Automatically adds createdAt and updatedAt
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Export Model
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const TermsCondition = mongoose.model('TermsCondition', TermsConditionSchema);
module.exports = { TermsCondition };
