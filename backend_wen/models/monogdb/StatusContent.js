const { required } = require('joi');
const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    trim: true
  },
 cont_id:{
type: String,
    required: true,
    trim: true
 },
 state:{
  type: String,
  enum: ['Pending' , 'Selected' , 'Rejected'],
  default: 'Pending'
 },
 createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

async function Statusschema (db){
 return db.model('StatusContent', statusSchema)
}
module.exports = Statusschema;