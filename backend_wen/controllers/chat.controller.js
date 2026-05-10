const moment = require("moment");
const SetupDatabase = require("../db/mongodb/setupDatabase");

class ChatController {
  
  async _getModels() {
    const db = await SetupDatabase.getConnection();
    return {
      User: await require('../models/monogdb/User')(db),
      Chat: await require('../models/monogdb/Chat')(db),
      Message: await require('../models/monogdb/Message')(db),
      WritersAssignedPublishers: await require('../models/monogdb/WritersAssignedPublishers')(db)
    };
  }

  async initiateChat(req, res, token_data) {
    try {
      const { targetUid } = req.body;
      const myUid = token_data.uid;
      const myRole = token_data.role; // e.g. 'admin', 'writer', 'publisher'
      
      if (!targetUid) {
        return res.status(400).json({ status: 400, message: "targetUid is required" });
      }

      if (myUid === targetUid) {
        return res.status(400).json({ status: 400, message: "Cannot initiate chat with yourself" });
      }

      const { User, Chat, WritersAssignedPublishers } = await this._getModels();

      // 1. Verify target user exists
      const targetUser = await User.findOne({ uid: targetUid });
      if (!targetUser) {
        return res.status(404).json({ status: 404, message: "Target user not found" });
      }

      // 2. Role-based authorization
      if (myRole !== 'admin' && myRole !== 'both') {
        let isAuthorized = false;
        
        if (myRole === 'writer' && targetUser.role === 'publisher') {
          // Check if assigned
          const assignment = await WritersAssignedPublishers.findOne({
            writer_uid: myUid,
            publisher_uid: targetUid,
            status: { $in: ['Pending', 'Accepted'] }
          });
          if (assignment) isAuthorized = true;
        } else if (myRole === 'publisher' && targetUser.role === 'user') {
          // Check if assigned (user = writer)
          const assignment = await WritersAssignedPublishers.findOne({
            writer_uid: targetUid,
            publisher_uid: myUid,
            status: { $in: ['Pending', 'Accepted'] }
          });
          if (assignment) isAuthorized = true;
        }
        
        if (!isAuthorized) {
          return res.status(403).json({ status: 403, message: "Unauthorized to chat with this user" });
        }
      }

      // 3. Check if an active chat already exists
      let chat = await Chat.findOne({
        "participants.uid": { $all: [myUid, targetUid] },
        participants: { $size: 2 },
        is_deleted: { $ne: true }
      });

      if (!chat) {
        // Fetch my full info to get full_name
        const myUser = await User.findOne({ uid: myUid });

        // Create new chat
        chat = new Chat({
          participants: [
            { uid: myUid, role: myRole, full_name: myUser.full_name, email: myUser.email },
            { uid: targetUid, role: targetUser.role, full_name: targetUser.full_name, email: targetUser.email }
          ],
          unreadCounts: {
            [myUid]: 0,
            [targetUid]: 0
          }
        });
        await chat.save();
      }

      return res.status(200).json({
        status: 200,
        message: "Chat initiated successfully",
        data: chat
      });

    } catch (error) {
      console.error("initiateChat error:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }

  async getChats(req, res, token_data) {
    try {
      const { Chat, Message } = await this._getModels();
      
      const chats = await Chat.find({ "participants.uid": token_data.uid, is_deleted: { $ne: true } })
                              .populate('lastMessage')
                              .sort({ updatedAt: -1 })
                              .exec();

      return res.status(200).json({
        status: 200,
        message: "Chats fetched successfully",
        data: chats
      });
    } catch (error) {
      console.error("getChats error:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }

  async getMessages(req, res, token_data) {
    try {
      const { chatId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const { Chat, Message } = await this._getModels();

      const chat = await Chat.findOne({ chatId, "participants.uid": token_data.uid });
      if (!chat) {
        return res.status(403).json({ status: 403, message: "Unauthorized or chat not found" });
      }

      const totalMessages = await Message.countDocuments({ chatId, is_deleted: { $ne: true } });
      const messages = await Message.find({ chatId, is_deleted: { $ne: true } })
                                    .sort({ createdAt: -1 })
                                    .skip(skip)
                                    .limit(limit)
                                    .exec();
                                    
      // Reverse to send oldest first on the page
      messages.reverse();

      return res.status(200).json({
        status: 200,
        message: "Messages fetched",
        data: messages,
        pagination: {
          totalMessages,
          totalPages: Math.ceil(totalMessages / limit),
          currentPage: page,
          pageSize: limit
        }
      });
    } catch (error) {
      console.error("getMessages error:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }

  async markSeen(req, res, token_data) {
    try {
      const { chatId } = req.params;
      
      const { Chat, Message } = await this._getModels();

      const chatDoc = await Chat.findOne({ chatId, "participants.uid": token_data.uid });
      if (!chatDoc) {
        return res.status(403).json({ status: 403, message: "Unauthorized or chat not found" });
      }

      await Message.updateMany(
          { chatId, senderId: { $ne: token_data.uid }, status: { $ne: "seen" } },
          { $set: { status: "seen", updatedAt: moment().unix() } }
      );
      
      chatDoc.unreadCounts.set(token_data.uid, 0);
      await chatDoc.save();

      return res.status(200).json({
        status: 200,
        message: "Messages marked as seen"
      });

    } catch (error) {
      console.error("markSeen error:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }
}

module.exports = new ChatController();
