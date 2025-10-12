import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createOlderUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create some users with older creation dates
    const olderUsers = [
      {
        name: 'Old User 1',
        email: 'olduser1@test.com',
        phoneNumber: '9876543210',
        password: 'password123',
        profileFor: 'self',
        gender: 'female',
        dob: new Date('1990-01-01'),
        city: 'Mumbai',
        state: 'Maharashtra',
        religion: 'Hindu',
        caste: 'Brahmin',
        maritalStatus: 'never_married',
        education: 'B.Tech',
        occupation: 'Engineer',
        height: '5.4',
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: new Date('2024-01-01'), // 1 year ago
        coordinates: { lat: 19.0760, lng: 72.8777 }
      },
      {
        name: 'Old User 2',
        email: 'olduser2@test.com',
        phoneNumber: '9876543211',
        password: 'password123',
        profileFor: 'self',
        gender: 'female',
        dob: new Date('1988-05-15'),
        city: 'Delhi',
        state: 'Delhi',
        religion: 'Hindu',
        caste: 'Gupta',
        maritalStatus: 'never_married',
        education: 'MBA',
        occupation: 'Manager',
        height: '5.5',
        isEmailVerified: true,
        isPhoneVerified: false,
        createdAt: new Date('2024-06-01'), // 6 months ago
        coordinates: { lat: 28.6139, lng: 77.2090 }
      },
      {
        name: 'Old User 3',
        email: 'olduser3@test.com',
        phoneNumber: '9876543212',
        password: 'password123',
        profileFor: 'self',
        gender: 'female',
        dob: new Date('1992-12-10'),
        city: 'Bangalore',
        state: 'Karnataka',
        religion: 'Hindu',
        caste: 'Reddy',
        maritalStatus: 'never_married',
        education: 'M.Tech',
        occupation: 'Developer',
        height: '5.3',
        isEmailVerified: false,
        isPhoneVerified: true,
        createdAt: new Date('2024-03-01'), // 9 months ago
        coordinates: { lat: 12.9716, lng: 77.5946 }
      }
    ];

    for (const userData of olderUsers) {
      try {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.name}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  User ${userData.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating user ${userData.name}:`, error.message);
        }
      }
    }

    console.log('\n✅ Older users creation completed');

  } catch (error) {
    console.error('Error creating older users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
createOlderUsers();
