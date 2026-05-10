const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller.js');
const { GetUserAuthorization } = require('../utils/Authorization');

// Authentication middleware
const authMiddleware = async (req, res, next) => {
    try {
        const tokenData = await GetUserAuthorization(req.headers.authorization);
        if (tokenData && tokenData.error_code) {
            return res.status(401).json({ status: 401, message: tokenData.message });
        }
        
        // Let's populate uid if missing
        if (!tokenData.uid) {
            const SetupDatabase = require("../db/mongodb/setupDatabase");
            const db = await SetupDatabase.getConnection();
            const User = await require('../models/monogdb/User')(db);
            const user = await User.findOne({ email: tokenData.email });
            if (user) {
                tokenData.uid = user.uid;
            } else {
                return res.status(401).json({ status: 401, message: "User not found" });
            }
        }

        req.tokenData = tokenData;
        next();
    } catch (error) {
        return res.status(401).json({ status: 401, message: "Unauthorized" });
    }
};

router.use(authMiddleware);

router.post('/initiate', (req, res) => chatController.initiateChat(req, res, req.tokenData));
router.get('/', (req, res) => chatController.getChats(req, res, req.tokenData));
router.get('/:chatId/messages', (req, res) => chatController.getMessages(req, res, req.tokenData));
router.patch('/:chatId/seen', (req, res) => chatController.markSeen(req, res, req.tokenData));

module.exports = router;
