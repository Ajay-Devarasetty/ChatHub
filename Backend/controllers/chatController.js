const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

// Get or create conversation between two users
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (userId === currentUserId) {
      return res
        .status(400)
        .json({ error: "Cannot create conversation with yourself" });
    }

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, userId] },
    })
      .populate("participants", "name email avatar")
      .populate("lastMessageSender", "name");

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [currentUserId, userId],
      });
      await conversation.save();
      await conversation.populate("participants", "name email avatar");
    }

    res.status(200).json({ data: conversation });
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all conversations for logged-in user
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name email avatar")
      .populate("lastMessageSender", "name")
      .sort({ updatedAt: -1 });

    res.status(200).json({ data: conversations });
  } catch (error) {
    console.error("Error in getUserConversations:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get messages in a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this conversation" });
    }

    const messages = await Message.find({
      conversationId,
    })
      .populate("senderId", "name email avatar")
      .sort({ createdAt: 1 });

    res.status(200).json({ data: messages });
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ error: error.message });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    // conversationId can come from body or from URL params
    const conversationId = req.body.conversationId || req.params.conversationId;
    const { text } = req.body;
    const senderId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required" });
    }

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(senderId)) {
      return res
        .status(403)
        .json({ error: "Not authorized to send message in this conversation" });
    }

    // Create message
    const message = new Message({
      conversationId,
      senderId,
      text,
    });
    await message.save();

    // Update conversation
    conversation.lastMessage = text;
    conversation.lastMessageSender = senderId;
    conversation.lastMessageTime = new Date();
    await conversation.save();

    // Populate sender info
    await message.populate("senderId", "name email avatar");

    res.status(201).json({ data: message });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all online users (all registered users for now)
exports.getOnlineUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const users = await User.find(
      { _id: { $ne: currentUserId } },
      "name email avatar createdAt"
    );

    res.status(200).json({ data: users });
  } catch (error) {
    console.error("Error in getOnlineUsers:", error);
    res.status(500).json({ error: error.message });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Update all messages in conversation that haven't been read by current user
    await Message.updateMany(
      {
        conversationId,
        "readBy.userId": { $ne: userId },
      },
      {
        $push: {
          readBy: {
            userId,
            readAt: new Date(),
          },
        },
      }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error);
    res.status(500).json({ error: error.message });
  }
};
