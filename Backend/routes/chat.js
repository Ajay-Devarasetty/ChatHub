const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  getOnlineUsers,
  markMessagesAsRead,
} = require("../controllers/chatController");

// All routes are protected
router.use(protect);

// Conversation routes
router.post("/conversations", getOrCreateConversation);
router.get("/conversations", getUserConversations);
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/conversations/:conversationId/messages", sendMessage);
router.put("/conversations/:conversationId/read", markMessagesAsRead);

// Users route
router.get("/users/online", getOnlineUsers);

module.exports = router;
