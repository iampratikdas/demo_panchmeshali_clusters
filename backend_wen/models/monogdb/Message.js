const mongoose = require('mongoose');
const moment = require("moment");
const gen = require("../../utils/GenKey");

const messageSchema = new mongoose.Schema({
  messageId: {
    default: () => "msg_" + gen(10),
    type: String,
    unique: true,
  },
  chatId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'seen'],
    default: 'sent'
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: String,
    default: () => moment().unix()
  },
  updatedAt: {
    type: String,
    default: () => moment().unix()
  }
});

async function MessageSchema(db) {
  return db.model('Message', messageSchema);
}

module.exports = MessageSchema;
