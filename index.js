import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { Server } from "socket.io";
import http from 'http';
import cors from 'cors';

dotenv.config();
connectDB();

const app = express();

// ✅ Enable CORS for your frontend (http://localhost:5173)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://yourdomain.com"
  ],
  credentials: true
}));

app.use(express.json());

// 👉 Serve static files from the 'public' directory
app.use(express.static('public'));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "https://bandhan-ynnt.onrender.com", }
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

app.use('/api/auth', authRoutes);

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
