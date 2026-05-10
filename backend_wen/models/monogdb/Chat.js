const mongoose = require('mongoose');
const moment = require("moment");
const gen = require("../../utils/GenKey");

const chatSchema = new mongoose.Schema({
  chatId: {
    default: () => "chat_" + gen(10),
    type: String,
    unique: true,
  },
  participants: [{
    uid: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    },
    full_name: {
      type: String
    },
    email: {
      type: String
    }
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
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

async function ChatSchema(db) {
  return db.model('Chat', chatSchema);
}

module.exports = ChatSchema;
