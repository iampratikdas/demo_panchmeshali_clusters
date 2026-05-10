const { GetUserAuthorization } = require("../utils/Authorization");
const SetupDatabase = require("../db/mongodb/setupDatabase");
const moment = require("moment");

module.exports = (io) => {
    // Middleware for authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
            if (!token) return next(new Error("Authentication error"));

            const userData = await GetUserAuthorization(token);
            if (userData && userData.error_code) {
                return next(new Error(userData.message));
            }
            
            socket.user = userData; // contains email, full_name, role, etc.
            
            // We need uid since our JWT payload only has email, full_name, role etc.
            // Let's fetch the User to get their uid
            const db = await SetupDatabase.getConnection();
            const User = await require('../models/monogdb/User')(db);
            const userDoc = await User.findOne({ email: userData.email });
            
            if (!userDoc) return next(new Error("User not found"));
            
            socket.user.uid = userDoc.uid;
            
            next();
        } catch (err) {
            next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.user.uid} (${socket.user.full_name})`);

        // Broadcast user online status
        socket.broadcast.emit("user_online", { uid: socket.user.uid });

        // User joins a specific chat room
        socket.on("join_chat", (chatId) => {
            socket.join(chatId);
            console.log(`User ${socket.user.uid} joined chat ${chatId}`);
        });

        // User sends a message
        socket.on("send_message", async (data, callback) => {
            try {
                const { chatId, message } = data;
                
                const db = await SetupDatabase.getConnection();
                const Message = await require('../models/monogdb/Message')(db);
                const Chat = await require('../models/monogdb/Chat')(db);
                
                const chatDoc = await Chat.findOne({ chatId });
                if(!chatDoc) return callback && callback({ status: "error", message: "Chat not found" });

                const newMessage = new Message({
                    chatId,
                    senderId: socket.user.uid,
                    message,
                    status: "sent"
                });

                await newMessage.save();

                // Update chat's last message and unread count
                chatDoc.lastMessage = newMessage._id;
                chatDoc.updatedAt = moment().unix();
                
                // Increment unread count for other participants
                chatDoc.participants.forEach(p => {
                    if (p.uid !== socket.user.uid) {
                        const currentCount = chatDoc.unreadCounts.get(p.uid) || 0;
                        chatDoc.unreadCounts.set(p.uid, currentCount + 1);
                    }
                });

                await chatDoc.save();

                // Broadcast message to everyone in the room
                io.to(chatId).emit("receive_message", newMessage);
                
                if(callback) callback({ status: "success", data: newMessage });
                
            } catch (error) {
                console.error("Socket send_message error:", error);
                if(callback) callback({ status: "error", message: "Internal server error" });
            }
        });

        // User typing
        socket.on("typing", (chatId) => {
            socket.to(chatId).emit("user_typing", { uid: socket.user.uid, chatId });
        });

        // User stop typing
        socket.on("stop_typing", (chatId) => {
            socket.to(chatId).emit("user_stop_typing", { uid: socket.user.uid, chatId });
        });

        // Mark message as seen
        socket.on("mark_seen", async ({ chatId }) => {
            try {
                const db = await SetupDatabase.getConnection();
                const Message = await require('../models/monogdb/Message')(db);
                const Chat = await require('../models/monogdb/Chat')(db);
                
                // Mark messages as seen for this user
                await Message.updateMany(
                    { chatId, senderId: { $ne: socket.user.uid }, status: { $ne: "seen" } },
                    { $set: { status: "seen", updatedAt: moment().unix() } }
                );
                
                // Reset unread count for this user in this chat
                const chatDoc = await Chat.findOne({ chatId });
                if (chatDoc) {
                    chatDoc.unreadCounts.set(socket.user.uid, 0);
                    await chatDoc.save();
                }

                io.to(chatId).emit("message_seen", { chatId, seenBy: socket.user.uid });
            } catch (error) {
                console.error("Socket mark_seen error:", error);
            }
        });

        // User disconnects
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.user.uid}`);
            socket.broadcast.emit("user_offline", { uid: socket.user.uid });
        });
    });
};
