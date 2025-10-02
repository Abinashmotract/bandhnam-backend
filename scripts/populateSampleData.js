import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Interaction from '../models/Interaction.js';
import SystemSetting from '../models/SystemSetting.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bandhnam');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const populateSampleData = async () => {
  await connectDB();
  
  try {
    console.log('Starting to populate sample data...');
    
    // Create sample matches
    const users = await User.find({ role: 'user' }).limit(10);
    if (users.length >= 2) {
      // Check if matches already exist
      const existingMatches = await Interaction.countDocuments({ type: { $in: ['like', 'interest', 'shortlist'] } });
      
      if (existingMatches === 0) {
        const sampleMatches = [
          {
            fromUser: users[0]._id,
            toUser: users[1]._id,
            type: 'like',
            status: 'active',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
          },
          {
            fromUser: users[1]._id,
            toUser: users[0]._id,
            type: 'interest',
            status: 'active',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
          },
          {
            fromUser: users[2]?._id || users[0]._id,
            toUser: users[3]?._id || users[1]._id,
            type: 'shortlist',
            status: 'active',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
          }
        ];
        
        await Interaction.insertMany(sampleMatches);
        console.log('✅ Sample matches created');
      } else {
        console.log('✅ Sample matches already exist');
      }
    }
    
    // Create sample messages
    if (users.length >= 2) {
      const existingMessages = await Interaction.countDocuments({ type: 'message' });
      
      if (existingMessages === 0) {
        const sampleMessages = [
          {
            fromUser: users[0]._id,
            toUser: users[1]._id,
            type: 'message',
            messageContent: 'Hi! I saw your profile and I think we have a lot in common.',
            messageType: 'text',
            status: 'sent',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          },
          {
            fromUser: users[1]._id,
            toUser: users[0]._id,
            type: 'message',
            messageContent: 'Hello! Thank you for your interest. I would love to know more about you.',
            messageType: 'text',
            status: 'sent',
            createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000) // 23 hours ago
          },
          {
            fromUser: users[0]._id,
            toUser: users[1]._id,
            type: 'message',
            messageContent: 'Great! I am a software engineer working in Bangalore. What about you?',
            messageType: 'text',
            status: 'sent',
            createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000) // 22 hours ago
          }
        ];
        
        await Interaction.insertMany(sampleMessages);
        console.log('✅ Sample messages created');
      } else {
        console.log('✅ Sample messages already exist');
      }
    }
    
    // Create sample verification requests
    if (users.length >= 2) {
      const existingVerifications = await Interaction.countDocuments({ type: 'verification' });
      
      if (existingVerifications === 0) {
        const sampleVerifications = [
          {
            fromUser: users[0]._id,
            toUser: null,
            type: 'verification',
            verificationType: 'email',
            status: 'pending',
            verificationData: { email: users[0].email },
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
          },
          {
            fromUser: users[1]._id,
            toUser: null,
            type: 'verification',
            verificationType: 'phone',
            status: 'approved',
            verificationData: { phone: users[1].phoneNumber },
            verifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
          },
          {
            fromUser: users[2]?._id || users[0]._id,
            toUser: null,
            type: 'verification',
            verificationType: 'photo',
            status: 'rejected',
            verificationData: { photoUrl: 'sample-photo.jpg' },
            rejectionReason: 'Photo quality not clear',
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
          }
        ];
        
        await Interaction.insertMany(sampleVerifications);
        console.log('✅ Sample verification requests created');
      } else {
        console.log('✅ Sample verification requests already exist');
      }
    }
    
    // Create sample success stories
    if (users.length >= 2) {
      const existingSuccessStories = await Interaction.countDocuments({ type: 'success_story' });
      
      if (existingSuccessStories === 0) {
        const sampleSuccessStories = [
          {
            fromUser: users[0]._id,
            toUser: users[1]._id,
            type: 'success_story',
            status: 'approved',
            storyTitle: 'Our Perfect Match',
            storyContent: 'We met through BandhanM and it was love at first sight. We got married 6 months later and are now happily married for 2 years!',
            storyImages: ['wedding1.jpg', 'wedding2.jpg'],
            approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) // 35 days ago
          },
          {
            fromUser: users[2]?._id || users[0]._id,
            toUser: users[3]?._id || users[1]._id,
            type: 'success_story',
            status: 'pending',
            storyTitle: 'From Strangers to Soulmates',
            storyContent: 'We connected through the platform and found that we lived just 5 minutes away! Our families met and everything fell into place.',
            storyImages: ['couple1.jpg'],
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
          },
          {
            fromUser: users[4]?._id || users[0]._id,
            toUser: users[5]?._id || users[1]._id,
            type: 'success_story',
            status: 'approved',
            storyTitle: 'A Modern Love Story',
            storyContent: 'We both were skeptical about online matrimonial platforms, but BandhanM proved us wrong. We found our perfect match!',
            storyImages: ['engagement1.jpg', 'engagement2.jpg'],
            approvedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
          }
        ];
        
        await Interaction.insertMany(sampleSuccessStories);
        console.log('✅ Sample success stories created');
      } else {
        console.log('✅ Sample success stories already exist');
      }
    }
    
    // Create system settings
    const systemSettings = [
      {
        key: 'site_name',
        value: 'BandhanM',
        description: 'Website name',
        category: 'general'
      },
      {
        key: 'site_description',
        value: 'Find your perfect life partner',
        description: 'Website description',
        category: 'general'
      },
      {
        key: 'max_profile_photos',
        value: 5,
        description: 'Maximum number of photos per profile',
        category: 'profile'
      },
      {
        key: 'profile_completion_required',
        value: 80,
        description: 'Minimum profile completion percentage required',
        category: 'profile'
      },
      {
        key: 'email_verification_required',
        value: true,
        description: 'Whether email verification is required',
        category: 'verification'
      },
      {
        key: 'phone_verification_required',
        value: true,
        description: 'Whether phone verification is required',
        category: 'verification'
      },
      {
        key: 'max_daily_likes',
        value: 50,
        description: 'Maximum likes per day for free users',
        category: 'limits'
      },
      {
        key: 'max_daily_interests',
        value: 10,
        description: 'Maximum interests per day for free users',
        category: 'limits'
      },
      {
        key: 'maintenance_mode',
        value: false,
        description: 'Whether the site is in maintenance mode',
        category: 'system'
      },
      {
        key: 'registration_enabled',
        value: true,
        description: 'Whether new user registration is enabled',
        category: 'system'
      }
    ];
    
    for (const setting of systemSettings) {
      await SystemSetting.findOneAndUpdate(
        { key: setting.key },
        setting,
        { upsert: true }
      );
    }
    
    console.log('✅ System settings created');
    
    console.log('\n🎉 Sample data population completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Sample matches: 3');
    console.log('- Sample messages: 3');
    console.log('- Sample verification requests: 3');
    console.log('- Sample success stories: 3');
    console.log('- System settings: 10');
    
  } catch (error) {
    console.error('Error populating sample data:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
};

populateSampleData();
