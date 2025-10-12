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

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("sender message", (msg) => {
    console.log("Sender:", msg);
    socket.broadcast.emit("receiver message", msg);
  });

  socket.on("receiver message", (msg) => {
    console.log("Receiver:", msg);
    socket.broadcast.emit("sender message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
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
