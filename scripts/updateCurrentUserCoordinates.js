import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const updateCurrentUserCoordinates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'abinas@yopmail.com' });
    if (user) {
      user.coordinates = { lat: 25.5941, lng: 85.1376 }; // Patna coordinates
      await user.save();
      console.log('✅ Updated current user coordinates');
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('Error updating current user coordinates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updateCurrentUserCoordinates();
