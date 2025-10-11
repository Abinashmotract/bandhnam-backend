import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createSampleNotifications = async () => {
  try {
    // Find a user to create notifications for
    const user = await User.findOne({ email: 'abinash@yopmail.com' });
    if (!user) {
      console.log('User not found. Please create a user first.');
      return;
    }

    // Clear existing notifications for this user
    await Notification.deleteMany({ userId: user._id });

    // Create sample notifications
    const sampleNotifications = [
      {
        userId: user._id,
        type: 'match_of_day',
        title: 'Match of the Day',
        message: 'Meha Pratap Singh is your Match of the day, Connect now!',
        actionText: 'View Profile',
        actionUrl: '/matches',
        isRead: false
      },
      {
        userId: user._id,
        type: 'profile_live',
        title: 'Profile Live',
        message: 'Your profile is now live! Start sending interests to matches you like!',
        isRead: false
      },
      {
        userId: user._id,
        type: 'profile_view',
        title: 'Profile View',
        message: 'Priya Sharma viewed your profile',
        actionText: 'View Profile',
        actionUrl: '/matches',
        isRead: true
      },
      {
        userId: user._id,
        type: 'interest_received',
        title: 'Interest Received',
        message: 'Anjali Singh showed interest in your profile',
        actionText: 'View Profile',
        actionUrl: '/matches',
        isRead: true
      },
      {
        userId: user._id,
        type: 'premium_reminder',
        title: 'Premium Reminder',
        message: 'Upgrade to Premium to unlock all features and get 3x more matches!',
        actionText: 'Upgrade Now',
        actionUrl: '/membership',
        isRead: true
      },
      {
        userId: user._id,
        type: 'verification_approved',
        title: 'Verification Approved',
        message: 'Your email verification has been approved!',
        isRead: false
      },
      {
        userId: user._id,
        type: 'message_received',
        title: 'New Message',
        message: 'You received a new message from Priya Sharma',
        actionText: 'View Message',
        actionUrl: '/chat',
        isRead: false
      }
    ];

    // Create notifications with different timestamps
    const notifications = [];
    for (let i = 0; i < sampleNotifications.length; i++) {
      const notification = new Notification({
        ...sampleNotifications[i],
        createdAt: new Date(Date.now() - (i * 2 * 60 * 60 * 1000)) // 2 hours apart
      });
      notifications.push(notification);
    }

    await Notification.insertMany(notifications);
    console.log(`Created ${notifications.length} sample notifications for user ${user.email}`);
  } catch (error) {
    console.error('Error creating sample notifications:', error);
  }
};

const main = async () => {
  await connectDB();
  await createSampleNotifications();
  process.exit(0);
};

main();
