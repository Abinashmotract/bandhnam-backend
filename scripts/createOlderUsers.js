import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Dynamic data arrays for generating users
const firstNames = [
  'Priya', 'Anjali', 'Kavya', 'Sneha', 'Divya', 'Riya', 'Meera', 'Pooja',
  'Neha', 'Swati', 'Kiran', 'Jyoti', 'Anita', 'Manisha', 'Ritu', 'Shweta'
];

const lastNames = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Reddy', 'Nair', 'Iyyer',
  'Desai', 'Joshi', 'Mehta', 'Agarwal', 'Verma', 'Malhotra', 'Khanna', 'Kapoor'
];

const cities = [
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 }
];

const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist'];

const castes = {
  'Hindu': ['Brahmin', 'Kshatriya', 'Vaishya', 'Patel', 'Reddy', 'Gupta', 'Agarwal', 'Sharma'],
  'Muslim': ['Sunni', 'Shia', 'Pathan'],
  'Christian': ['Syrian Christian', 'Latin Christian'],
  'Sikh': ['Jat', 'Khatri'],
  'Jain': ['Digambar', 'Shwetambar'],
  'Buddhist': ['Theravada', 'Mahayana']
};

const educations = ['B.Tech', 'M.Tech', 'MBA', 'B.Com', 'M.Com', 'B.Sc', 'M.Sc', 'MBBS', 'PhD', 'BA', 'MA'];
const occupations = ['Engineer', 'Developer', 'Manager', 'Doctor', 'Teacher', 'CA', 'Business', 'Designer', 'Analyst', 'Consultant'];

const heights = ['5.0', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9', '6.0'];

const maritalStatuses = ['never_married', 'divorced', 'widow', 'widower'];

// Helper function to get random element from array
const getRandom = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to generate random date between min and max days ago
const getRandomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

// Helper function to generate random DOB (age between 25-40)
const getRandomDOB = () => {
  const age = Math.floor(Math.random() * 16) + 25; // Age between 25-40
  const year = new Date().getFullYear() - age;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month, day);
};

// Generate random phone number
const generatePhoneNumber = (index) => {
  const base = 9876500000;
  return String(base + index);
};

// Generate random email
const generateEmail = (name, index) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '');
  return `${cleanName}${index}@example.com`;
};

const createOlderUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const numUsers = 10; // Number of users to create
    const olderUsers = [];

    // Generate dynamic users with varied data
    for (let i = 0; i < numUsers; i++) {
      const firstName = getRandom(firstNames);
      const lastName = getRandom(lastNames);
      const name = `${firstName} ${lastName}`;
      const cityData = getRandom(cities);
      const religion = getRandom(religions);
      const caste = getRandom(castes[religion] || castes['Hindu']);
      const createdAtDaysAgo = Math.floor(Math.random() * 365) + 30; // Between 30 days to 1 year ago
      const createdAt = getRandomDate(createdAtDaysAgo);

      const userData = {
        name,
        email: generateEmail(name, i + 1),
        phoneNumber: generatePhoneNumber(i + 1),
        password: hashedPassword,
        profileFor: 'self',
        gender: Math.random() > 0.5 ? 'female' : 'male',
        dob: getRandomDOB(),
        city: cityData.name,
        state: cityData.state,
        location: `${cityData.name}, ${cityData.state}`,
        religion,
        caste,
        maritalStatus: getRandom(maritalStatuses),
        education: getRandom(educations),
        occupation: getRandom(occupations),
        height: getRandom(heights),
        isEmailVerified: Math.random() > 0.3, // 70% verified
        isPhoneVerified: Math.random() > 0.2, // 80% verified
        isOnline: Math.random() > 0.7, // 30% online
        isActive: true,
        agreeToTerms: true,
        isOtpVerified: true,
        createdAt,
        coordinates: { lat: cityData.lat + (Math.random() - 0.5) * 0.1, lng: cityData.lng + (Math.random() - 0.5) * 0.1 }
      };

      olderUsers.push(userData);
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const userData of olderUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [
            { email: userData.email },
            { phoneNumber: userData.phoneNumber }
          ]
        });

        if (existingUser) {
          console.log(`⚠️  User ${userData.name} already exists, skipping...`);
          skippedCount++;
          continue;
        }

        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.name} (Created ${Math.floor((new Date() - userData.createdAt) / (1000 * 60 * 60 * 24))} days ago)`);
        createdCount++;
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  User ${userData.name} already exists (duplicate key), skipping...`);
          skippedCount++;
        } else {
          console.error(`❌ Error creating user ${userData.name}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Older users creation completed!`);
    console.log(`   - Created: ${createdCount} new users`);
    console.log(`   - Skipped: ${skippedCount} existing users`);

  } catch (error) {
    console.error('Error creating older users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
createOlderUsers();
