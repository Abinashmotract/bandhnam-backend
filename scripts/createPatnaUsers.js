import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createPatnaUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create some users from Patna (same city as current user)
    const patnaUsers = [
      {
        name: 'Patna User 1',
        email: 'patnauser1@test.com',
        phoneNumber: '9876543220',
        password: 'password123',
        profileFor: 'self',
        gender: 'female',
        dob: new Date('1995-01-01'),
        city: 'Patna',
        state: 'Bihar',
        religion: 'Hindu',
        caste: 'Brahmin',
        maritalStatus: 'never_married',
        education: 'B.Tech',
        occupation: 'Engineer',
        height: '5.4',
        isEmailVerified: true,
        isPhoneVerified: true,
        coordinates: { lat: 25.5941, lng: 85.1376 } // Patna coordinates
      },
      {
        name: 'Patna User 2',
        email: 'patnauser2@test.com',
        phoneNumber: '9876543221',
        password: 'password123',
        profileFor: 'self',
        gender: 'female',
        dob: new Date('1993-05-15'),
        city: 'Patna',
        state: 'Bihar',
        religion: 'Hindu',
        caste: 'Gupta',
        maritalStatus: 'never_married',
        education: 'MBA',
        occupation: 'Manager',
        height: '5.5',
        isEmailVerified: true,
        isPhoneVerified: false,
        coordinates: { lat: 25.5941, lng: 85.1376 } // Patna coordinates
      }
    ];

    for (const userData of patnaUsers) {
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

    console.log('\n✅ Patna users creation completed');

  } catch (error) {
    console.error('Error creating Patna users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
createPatnaUsers();
