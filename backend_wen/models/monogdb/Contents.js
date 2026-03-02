const { required } = require('joi');
const mongoose = require('mongoose');
const moment = require("moment");
const contentSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
  },
  token:{
 type: String,
  },
  type: {
    type: String,
    // enum: ['story', 'media'],
    // default: 'story'
  },
  name:{
     type: String,
  },
  author_name:{
    type: String
  },
  status:{
    type: String,
    default : "Pending"
  },
  content:{
    type: String
  },
  marks:{
    type: Array
  },
  url:{
    type: String
  },
  eid:{
    //this is for event id
    type: String
  },

  event_content:{
 type: Boolean,
  },
 orgin_content:{
  type: Boolean,
  required: true
 },
 cont_id:{
  type: String,
    required: true,
    trim: true
 },
 page_id:{
    type: String,
    default: ''
    // required: true,
    // trim: true
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

async function Contentschema (db){
 return db.model('Contents', contentSchema)
}
module.exports = Contentschema;