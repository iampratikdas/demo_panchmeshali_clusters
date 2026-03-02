const { required } = require('joi');
const mongoose = require('mongoose');
const moment = require("moment");

const eventSchema = new mongoose.Schema({
 eid: {
    type: String,
    required: true,
    trim: true
 },
 name:{
  type:String
 },
 description:{
  type: String
 },
 active:{
  type: Boolean
 },
 created_by:{
  type: String
 },
 team:{
  type: Array, // team participating in that events
 }, 
 st_dt: {
  type: String, // start date of events
  default: moment().local().unix()
 },
 sh_list:{
  type: Number // number of short listing candidates on that events
 },
 en_dt: {
  type: String, // end date of events
  default: moment().local().unix()
 },
 parent :{
   type: String,
 },
 w_count:{
   type: Number // word count in that events
 },
 categories:{
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

async function Eventschema (db){
 return db.model('Events', eventSchema)
}
module.exports = Eventschema;