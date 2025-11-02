import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import connectDB from './config/db.js';
import { Server } from "socket.io";
import http from 'http';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from "./routes/profileRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import interactionRoutes from "./routes/interactionRoutes.js";
import messagingRoutes from "./routes/messagingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminPanelRoutes from "./routes/adminPanelRoutes.js";
import horoscopeRoutes from "./routes/horoscopeRoutes.js";
import successStoryRoutes from "./routes/successStoryRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import adminRoutes from "./admin/routes/adminRoutes.js";
import membershipRoutes from "./admin/routes/membershipRoutes.js";
import subscriptionManagementRoutes from "./routes/subscriptionManagementRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import MembershipPlan from "./routes/usersMembershipRoutes.js";

// Admin panel new routes
import matchesRoutes from "./routes/matchesRoutes.js";
import messagesRoutes from "./routes/messagesRoutes.js";
import adminVerificationRoutes from "./routes/verificationRoutes.js";
import userVerificationRoutes from "./routes/userVerificationRoutes.js";
import adminAnalyticsRoutes from "./routes/analyticsRoutes.js";
import successStoriesRoutes from "./routes/successStoriesRoutes.js";
import systemSettingsRoutes from "./routes/systemSettingsRoutes.js";
import seedRoutes from "./routes/seedRoutes.js";
import notificationsRoutes from "./routes/notificationsRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

// Import middleware
import { generalLimiter, authLimiter, otpLimiter, searchLimiter, messageLimiter, adminLimiter } from "./middlewares/rateLimiter.js";
import { auditLogger, securityLogger } from "./middlewares/auditLogger.js";

connectDB();

const app = express();

// ✅ Enable CORS for your frontend (http://localhost:5173)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://bandhan-ynnt.onrender.com",
    "https://bandhanm-panel.onrender.com"
  ],
  credentials: true
}));

app.use(express.json());

// Apply rate limiting - TEMPORARILY COMMENTED OUT DUE TO RATE LIMITING ISSUES
// app.use(generalLimiter);

// Apply audit logging
app.use(auditLogger);

// 👉 Serve static files from the 'public' directory
app.use(express.static('public'));

app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test matches endpoint without auth for debugging
app.get('/api/matches/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Matches endpoint is accessible',
    data: []
  });
});

// Import Socket.IO dependencies
import { authenticateSocket } from './utils/socketAuth.js';
import Message from './models/Message.js';
import ChatRoom from './models/ChatRoom.js';
import User from './models/User.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: { 
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use(authenticateSocket);

// Store active user rooms: userId -> Set of roomIds
const userRooms = new Map();

io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id} (User: ${socket.userId})`);

  // Join user's personal room for notifications
  const userRoom = `user_${socket.userId}`;
  socket.join(userRoom);

  // Update user online status
  User.findByIdAndUpdate(socket.userId, { 
    isOnline: true, 
    lastSeen: new Date() 
  }).catch(err => console.error('Error updating online status:', err));

  // Join chat room with another user
  socket.on('join_room', async (roomId) => {
    try {
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room: ${roomId}`);
      
      // Track user's rooms
      if (!userRooms.has(socket.userId)) {
        userRooms.set(socket.userId, new Set());
      }
      userRooms.get(socket.userId).add(roomId);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  });

  // Leave chat room
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    if (userRooms.has(socket.userId)) {
      userRooms.get(socket.userId).delete(roomId);
    }
    console.log(`User ${socket.userId} left room: ${roomId}`);
  });

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { receiverId, content, messageType = 'text', roomId } = data;

      if (!receiverId || !content) {
        socket.emit('message_error', { message: 'Receiver ID and content are required' });
        return;
      }

      const senderId = socket.userId;

      // Create message in database
      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content: content.trim(),
        messageType
      });

      // Get or create chat room
      let chatRoom = await ChatRoom.findOne({
        participants: { $all: [senderId, receiverId] },
        isActive: true
      });

      if (!chatRoom) {
        chatRoom = await ChatRoom.create({
          participants: [senderId, receiverId],
          isActive: true
        });
      }

      // Update chat room
      chatRoom.lastMessage = message._id;
      chatRoom.lastMessageAt = message.createdAt;
      
      // Update unread counts
      const receiverCount = chatRoom.messageCounts.find(mc => 
        mc.user.toString() === receiverId
      );
      if (receiverCount) {
        receiverCount.unreadCount = (receiverCount.unreadCount || 0) + 1;
      } else {
        chatRoom.messageCounts.push({
          user: receiverId,
          unreadCount: 1
        });
      }

      // Clear sender's unread count
      const senderCount = chatRoom.messageCounts.find(mc => 
        mc.user.toString() === senderId
      );
      if (senderCount) {
        senderCount.unreadCount = 0;
      }

      await chatRoom.save();

      // Populate message with sender info
      await message.populate('sender', 'name profileImage customId');
      await message.populate('receiver', 'name profileImage customId');

      // Emit to sender (confirmation)
      socket.emit('message_sent', {
        success: true,
        message: {
          _id: message._id,
          content: message.content,
          messageType: message.messageType,
          sender: {
            _id: message.sender._id,
            name: message.sender.name,
            profileImage: message.sender.profileImage,
            customId: message.sender.customId
          },
          receiver: {
            _id: message.receiver._id,
            name: message.receiver.name
          },
          createdAt: message.createdAt,
          isRead: message.isRead
        }
      });

      // Emit to receiver (new message)
      const receiverRoom = `user_${receiverId}`;
      io.to(receiverRoom).emit('new_message', {
        success: true,
        message: {
          _id: message._id,
          content: message.content,
          messageType: message.messageType,
          sender: {
            _id: message.sender._id,
            name: message.sender.name,
            profileImage: message.sender.profileImage,
            customId: message.sender.customId
          },
          receiver: {
            _id: message.receiver._id,
            name: message.receiver.name
          },
          createdAt: message.createdAt,
          isRead: message.isRead
        },
        chatRoomId: chatRoom._id.toString()
      });

      // Also emit to the chat room if users are in it
      const chatRoomId = roomId || chatRoom._id.toString();
      io.to(chatRoomId).emit('message_received', {
        message: {
          _id: message._id,
          content: message.content,
          messageType: message.messageType,
          sender: {
            _id: message.sender._id,
            name: message.sender.name,
            profileImage: message.sender.profileImage
          },
          createdAt: message.createdAt
        }
      });

    } catch (error) {
      console.error('Error sending message via socket:', error);
      socket.emit('message_error', { 
        message: error.message || 'Failed to send message' 
      });
    }
  });

  // Mark messages as read
  socket.on('mark_read', async (data) => {
    try {
      const { senderId, messageIds } = data;
      const receiverId = socket.userId;

      if (messageIds && Array.isArray(messageIds)) {
        await Message.updateMany(
          { 
            _id: { $in: messageIds },
            sender: senderId,
            receiver: receiverId,
            isRead: false
          },
          { 
            isRead: true,
            readAt: new Date()
          }
        );
      } else {
        // Mark all messages from sender as read
        await Message.updateMany(
          {
            sender: senderId,
            receiver: receiverId,
            isRead: false
          },
          {
            isRead: true,
            readAt: new Date()
          }
        );
      }

      // Update chat room unread count
      const chatRoom = await ChatRoom.findOne({
        participants: { $all: [senderId, receiverId] },
        isActive: true
      });

      if (chatRoom) {
        const receiverCount = chatRoom.messageCounts.find(mc => 
          mc.user.toString() === receiverId
        );
        if (receiverCount) {
          receiverCount.unreadCount = 0;
          await chatRoom.save();
        }
      }

      // Notify sender that messages were read
      const senderRoom = `user_${senderId}`;
      io.to(senderRoom).emit('messages_read', {
        receiverId,
        readAt: new Date()
      });

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Typing indicator
  socket.on('typing_start', (data) => {
    const { roomId, receiverId } = data;
    const receiverRoom = `user_${receiverId}`;
    socket.to(receiverRoom).emit('user_typing', {
      userId: socket.userId,
      userName: socket.userName,
      roomId
    });
  });

  socket.on('typing_stop', (data) => {
    const { roomId, receiverId } = data;
    const receiverRoom = `user_${receiverId}`;
    socket.to(receiverRoom).emit('user_stopped_typing', {
      userId: socket.userId,
      roomId
    });
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    console.log(`❌ Client disconnected: ${socket.id} (User: ${socket.userId})`);
    
    // Update user offline status
    if (socket.userId) {
      User.findByIdAndUpdate(socket.userId, { 
        isOnline: false,
        lastSeen: new Date()
      }).catch(err => console.error('Error updating offline status:', err));
    }

    // Clean up user rooms
    userRooms.delete(socket.userId);
  });
});

// Admin routes with admin rate limiting
app.use("/api/admin", adminRoutes);
app.use("/api/admin/membership", membershipRoutes);
app.use("/api/admin/panel", adminPanelRoutes);
app.use("/api/membership", subscriptionManagementRoutes);

// Auth routes with auth rate limiting authLimiter
app.use('/api/auth', authRoutes);

// OTP routes with OTP rate limiting
app.use('/api/auth/otp', otpLimiter);

// Profile and search routes
app.use("/api/profiles", profileRoutes);
// app.use("/api/search", searchLimiter, searchRoutes); // TEMPORARILY COMMENTED OUT DUE TO RATE LIMITING ISSUES
app.use("/api/search", searchRoutes);

// Interaction routes
app.use("/api/interactions", interactionRoutes);

// Messaging routes with message rate limiting - TEMPORARILY COMMENTED OUT DUE TO RATE LIMITING ISSUES
// app.use("/api/chat", messageLimiter, messagingRoutes);
app.use("/api/chat", messagingRoutes);

// Verification routes
app.use("/api/verify", userVerificationRoutes);

// Matches routes
app.use("/api/matches", matchesRoutes);

// Notification routes
app.use("/api/notifications", notificationsRoutes);

// Contact and membership routes
app.use("/api/contact", contactRoutes);
app.use("/api/user/membership", MembershipPlan);
app.use("/api/user/subscription", subscriptionRoutes);

// New feature routes
app.use("/api/horoscope", horoscopeRoutes);
app.use("/api/success-stories", successStoryRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/analytics", adminAnalyticsRoutes);

// Admin panel routes
app.use("/api/admin/matches", matchesRoutes);
app.use("/api/admin/messages", messagesRoutes);
app.use("/api/admin/verification", adminVerificationRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/admin/success-stories", successStoriesRoutes);
app.use("/api/admin/settings", systemSettingsRoutes);

// Seed data routes
app.use("/api/seed", seedRoutes);

// Activity and conversation routes
app.use("/api/activity", activityRoutes);
app.use("/api/conversations", conversationRoutes);

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
