require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");

const app = express();

// Connect to MongoDB
connectDB();

// CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "MERN Chat API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server Error" });
});

// Start server with Socket.io
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Simple in-memory maps to track sockets and typing timers
const userSockets = new Map(); // userId -> Set of socketIds
const socketUsers = new Map(); // socketId -> userId
const typingTimers = new Map(); // key: conversationId:userId -> timeout

// Helper to authenticate token and extract user id
const jwt = require("jsonwebtoken");
function getUserIdFromToken(token) {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (err) {
    return null;
  }
}

io.on("connection", (socket) => {
  // Expect token as query or via auth handshake
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  const userId = getUserIdFromToken(token);
  if (!userId) {
    // unauthorized socket - disconnect
    socket.disconnect(true);
    return;
  }

  // register socket
  socketUsers.set(socket.id, userId);
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId).add(socket.id);

  // join a personal room for direct emits
  socket.join(`user:${userId}`);

  // Join conversation room when requested
  socket.on("joinConversation", (conversationId) => {
    if (conversationId) socket.join(`conv:${conversationId}`);
  });

  // Handle typing events
  socket.on("typing", ({ conversationId }) => {
    if (!conversationId) return;
    // broadcast to conversation excluding sender
    socket
      .to(`conv:${conversationId}`)
      .emit("typing", { conversationId, userId });

    // Reset server-side 60s timer for this user+conversation
    const key = `${conversationId}:${userId}`;
    if (typingTimers.has(key)) {
      clearTimeout(typingTimers.get(key));
    }
    const t = setTimeout(() => {
      socket
        .to(`conv:${conversationId}`)
        .emit("stopTyping", { conversationId, userId });
      typingTimers.delete(key);
    }, 60000); // 60 seconds
    typingTimers.set(key, t);
  });

  socket.on("stopTyping", ({ conversationId }) => {
    if (!conversationId) return;
    socket
      .to(`conv:${conversationId}`)
      .emit("stopTyping", { conversationId, userId });
    const key = `${conversationId}:${userId}`;
    if (typingTimers.has(key)) {
      clearTimeout(typingTimers.get(key));
      typingTimers.delete(key);
    }
  });

  // Handle sendMessage: save to DB and broadcast
  socket.on("sendMessage", async ({ conversationId, text }) => {
    try {
      if (!conversationId || !text || !text.trim()) return;
      const Message = require("./models/Message");
      const Conversation = require("./models/Conversation");

      const message = new Message({ conversationId, senderId: userId, text });
      await message.save();

      // Update conversation metadata
      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        conversation.lastMessage = text;
        conversation.lastMessageSender = userId;
        conversation.lastMessageTime = new Date();
        await conversation.save();
      }

      await message.populate("senderId", "name email avatar");

      // Broadcast to conversation room
      io.to(`conv:${conversationId}`).emit("newMessage", {
        conversationId,
        message,
      });

      // Clear typing timer and emit stopTyping
      const key = `${conversationId}:${userId}`;
      if (typingTimers.has(key)) {
        clearTimeout(typingTimers.get(key));
        typingTimers.delete(key);
      }
      socket
        .to(`conv:${conversationId}`)
        .emit("stopTyping", { conversationId, userId });
    } catch (err) {
      console.error("Error handling sendMessage socket event:", err);
    }
  });

  socket.on("disconnect", () => {
    const uid = socketUsers.get(socket.id);
    if (uid && userSockets.has(uid)) {
      userSockets.get(uid).delete(socket.id);
      if (userSockets.get(uid).size === 0) userSockets.delete(uid);
    }
    socketUsers.delete(socket.id);
  });
});

// Start HTTP server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
