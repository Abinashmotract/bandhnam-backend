import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB at:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// NOTE: sampleData has been removed

// Generate random date of birth (age between 25-35)
const generateDOB = () => {
  const currentYear = new Date().getFullYear();
  const age = Math.floor(Math.random() * 11) + 25; // 25-35 years
  const year = currentYear - age;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month, day);
};

// Generate random phone number
const generatePhoneNumber = () => {
  const prefixes = ['9876', '8765', '7654', '6543', '5432', '4321', '3210', '2109'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return prefix + suffix;
};

// Generate random email
const generateEmail = (name) => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const cleanName = name.toLowerCase().replace(/\s+/g, '');
  const randomNum = Math.floor(Math.random() * 1000);
  return `${cleanName}${randomNum}@${domain}`;
};

// Create a single sample profile
// NOTE: This function has been disabled as sampleData has been removed
const createSampleProfile = (index) => {
  throw new Error('Sample profile creation has been disabled. sampleData has been removed.');

  const dob = generateDOB();
  const age = new Date().getFullYear() - dob.getFullYear();

  return {
    name,
    email: generateEmail(name),
    phoneNumber: generatePhoneNumber(),
    password: bcrypt.hashSync('password123', 10), // Default password for all sample profiles
    profileFor: 'self',
    gender,
    dob,
    state,
    city,
    location: `${city}, ${state}`,
    religion,
    caste,
    subCaste: `${caste} - ${Math.random() < 0.5 ? 'Traditional' : 'Modern'}`,
    motherTongue: [motherTongue],
    maritalStatus,
    highestQualification: education,
    fieldOfStudy: education.includes('Tech') ? 'Computer Science' : 
                  education.includes('B.Com') ? 'Commerce' : 
                  education.includes('B.A') ? 'Arts' : 'Science',
    occupation,
    industry: occupation.includes('Engineer') ? 'Technology' :
              occupation.includes('Doctor') ? 'Healthcare' :
              occupation.includes('Teacher') ? 'Education' :
              occupation.includes('Business') ? 'Business' : 'Other',
    annualIncome,
    education,
    height,
    weight: `${Math.floor(Math.random() * 30) + 50} kg`,
    bodyType,
    complexion,
    diet,
    drinkingHabits,
    smokingHabits,
    fitnessLevel,
    hobbies: selectedHobbies,
    interests: selectedInterests,
    languagesKnown: selectedLanguages,
    petPreferences: Math.random() < 0.5 ? 'Dog Lover' : 'Cat Lover',
    fatherOccupation,
    motherOccupation,
    brothers: Math.floor(Math.random() * 3),
    brothersMarried: Math.random() < 0.7,
    sisters: Math.floor(Math.random() * 3),
    sistersMarried: Math.random() < 0.7,
    familyType,
    familyIncome: annualIncome,
    nativePlace: city,
    familyStatus,
    about: `I am a ${age}-year-old ${education} graduate from ${city}, currently working as a ${occupation}. I believe in traditional values and am looking for a partner who shares similar interests and life goals. I enjoy ${selectedHobbies.slice(0, 3).join(', ')} in my free time.`,
    photos,
    profileImage,
    agreeToTerms: true,
    role: 'user',
    isOtpVerified: true,
    isEmailVerified: Math.random() < 0.8,
    isPhoneVerified: Math.random() < 0.7,
    isIdVerified: Math.random() < 0.5,
    isPhotoVerified: Math.random() < 0.6,
    isActive: true,
    profileCompletion: Math.floor(Math.random() * 30) + 70, // 70-100%
    
    // Partner preferences
    preferences: {
      ageRange: {
        min: age - 3,
        max: age + 3
      },
      heightRange: {
        min: gender === 'male' ? '5\'2"' : '5\'0"',
        max: gender === 'male' ? '6\'0"' : '5\'8"'
      },
      maritalStatus: 'never_married',
      religion: religion,
      education: education,
      profession: occupation,
      location: city,
      diet: diet,
      qualities: ['Family Oriented', 'Career Focused', 'Good Looking', 'Well Educated'],
      dealBreakers: ['Smoking', 'Drinking', 'Non-Vegetarian'],
      educationPref: education,
      occupationPref: [occupation],
      annualIncomePref: annualIncome,
      lifestyleExpectations: {
        diet: diet,
        drinking: drinkingHabits,
        smoking: smokingHabits
      },
      religionCastePref: religion,
      locationPref: city,
      relocation: Math.random() < 0.5 ? 'Yes' : 'No',
      familyOrientation: 'Traditional',
      maritalStatusPref: 'never_married'
    }
  };
};

// Main function to create and insert sample profiles
const createSampleProfiles = async () => {
  try {
    await connectDB();

    // Clear existing sample profiles (optional - remove this if you want to keep existing data)
    console.log('Clearing existing sample profiles...');
    await User.deleteMany({ email: { $regex: /@(gmail|yahoo|hotmail|outlook|rediffmail)\.com$/ } });
    
    console.log('Creating 20 sample profiles...');
    const profiles = [];
    
    for (let i = 0; i < 20; i++) {
      const profile = createSampleProfile(i);
      profiles.push(profile);
    }

    // Insert all profiles
    const createdProfiles = await User.insertMany(profiles);
    console.log(`Successfully created ${createdProfiles.length} sample profiles!`);
    
    // Display summary
    console.log('\nProfile Summary:');
    console.log('================');
    createdProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.name} (${profile.gender}) - ${profile.city}, ${profile.state}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Occupation: ${profile.occupation}`);
      console.log(`   Education: ${profile.education}`);
      console.log(`   Custom ID: ${profile.customId}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating sample profiles:', error);
    process.exit(1);
  }
};

// Run the script
createSampleProfiles();
