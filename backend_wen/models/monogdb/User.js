const mongoose = require('mongoose');
const moment = require("moment");
const gen = require("../../utils/GenKey");
const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  uid: {
    default: gen(10),
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  ph_country_code: {
    type: String,
    default: ""
  },
  badge: {
    type: Array
  },
   type: {
    type: Array
  },

  phone_number: {
    type: String,
    default: ""
  },
  address: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'manager'],
    default: 'user'
  },
  skills: {
    type: String,
    default: "writer"
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isfirstTimeLogin: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profileImage: {
    type: String,// URL or file path
    default: ""
  },
  dob: {
    type: String,
    default: ""
  },
  is_deleted: {
    type: Boolean,
    default: false
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

async function Userschema(db) {
  return db.model('User', userSchema)
}
module.exports = Userschema;