import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // If admin, attach decoded token
    if (decoded.role === 'admin') {
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      return next();
    }

    // For users, fetch from database
    const user = await User.findById(decoded.id).select('_id name email role isOnline');
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    socket.userName = user.name;
    
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};

