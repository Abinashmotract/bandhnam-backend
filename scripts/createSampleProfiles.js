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

// Sample data for creating realistic profiles
const sampleData = {
  names: {
    male: [
      'Arjun Sharma', 'Rahul Patel', 'Vikram Singh', 'Amit Kumar', 'Rajesh Gupta',
      'Suresh Verma', 'Pradeep Jain', 'Nikhil Agarwal', 'Rohit Mehta', 'Kunal Shah'
    ],
    female: [
      'Priya Sharma', 'Anita Patel', 'Sneha Singh', 'Kavya Kumar', 'Riya Gupta',
      'Shruti Verma', 'Pooja Jain', 'Neha Agarwal', 'Divya Mehta', 'Kriti Shah'
    ]
  },
  cities: [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
    'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara'
  ],
  states: [
    'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana',
    'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh',
    'Bihar', 'Punjab', 'Haryana', 'Kerala', 'Odisha', 'Assam', 'Jharkhand'
  ],
  occupations: [
    'Software Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Banker', 'Lawyer',
    'Architect', 'Engineer', 'Marketing Manager', 'Sales Executive', 'Consultant',
    'Designer', 'Accountant', 'Pharmacist', 'Nurse', 'Journalist', 'Photographer',
    'Chef', 'Real Estate Agent', 'Financial Advisor'
  ],
  educations: [
    'B.Tech', 'MBBS', 'B.Ed', 'MBA', 'B.Com', 'B.Sc', 'B.A', 'M.Tech', 'MD', 'PhD',
    'CA', 'CS', 'ICWA', 'LLB', 'B.Arch', 'B.Pharm', 'M.Sc', 'M.A', 'M.Com', 'Diploma'
  ],
  religions: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Other'],
  castes: [
    'Brahmin', 'Kshatriya', 'Vaishya', 'Shudra', 'Patel', 'Gupta', 'Sharma', 'Verma',
    'Jain', 'Agarwal', 'Mehta', 'Shah', 'Singh', 'Kumar', 'Reddy', 'Naidu', 'Iyer',
    'Iyengar', 'Nair', 'Menon'
  ],
  motherTongues: [
    'Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Urdu',
    'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese', 'Nepali', 'Sanskrit'
  ],
  maritalStatuses: ['never_married', 'divorced', 'widow', 'widower'],
  heights: ['5\'0"', '5\'1"', '5\'2"', '5\'3"', '5\'4"', '5\'5"', '5\'6"', '5\'7"', '5\'8"', '5\'9"', '5\'10"', '5\'11"', '6\'0"', '6\'1"', '6\'2"'],
  bodyTypes: ['Slim', 'Average', 'Athletic', 'Heavy'],
  complexions: ['Very Fair', 'Fair', 'Wheatish', 'Wheatish Brown', 'Dark'],
  diets: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain Vegetarian', 'Eggetarian'],
  drinkingHabits: ['Never', 'Occasionally', 'Socially', 'Regularly'],
  smokingHabits: ['Never', 'Occasionally', 'Socially', 'Regularly'],
  fitnessLevels: ['Not Active', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'],
  hobbies: [
    'Reading', 'Traveling', 'Cooking', 'Photography', 'Music', 'Dancing', 'Sports',
    'Painting', 'Gardening', 'Movies', 'Gaming', 'Fitness', 'Writing', 'Singing',
    'Yoga', 'Meditation', 'Chess', 'Cricket', 'Football', 'Badminton'
  ],
  familyTypes: ['Nuclear', 'Joint', 'Extended'],
  familyStatuses: ['Middle Class', 'Upper Middle Class', 'Rich', 'Affluent'],
  fatherOccupations: [
    'Government Employee', 'Business Owner', 'Doctor', 'Engineer', 'Teacher',
    'Banker', 'Farmer', 'Retired', 'Lawyer', 'Consultant'
  ],
  motherOccupations: [
    'Homemaker', 'Teacher', 'Doctor', 'Government Employee', 'Business Owner',
    'Nurse', 'Retired', 'Banker', 'Engineer', 'Consultant'
  ],
  annualIncomes: [
    'Below 2 Lakh', '2-5 Lakh', '5-10 Lakh', '10-15 Lakh', '15-25 Lakh',
    '25-50 Lakh', '50 Lakh - 1 Crore', 'Above 1 Crore'
  ],
  profileImages: [
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  ]
};

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
const createSampleProfile = (index) => {
  const gender = Math.random() < 0.5 ? 'male' : 'female';
  const name = sampleData.names[gender][Math.floor(Math.random() * sampleData.names[gender].length)];
  const city = sampleData.cities[Math.floor(Math.random() * sampleData.cities.length)];
  const state = sampleData.states[Math.floor(Math.random() * sampleData.states.length)];
  const occupation = sampleData.occupations[Math.floor(Math.random() * sampleData.occupations.length)];
  const education = sampleData.educations[Math.floor(Math.random() * sampleData.educations.length)];
  const religion = sampleData.religions[Math.floor(Math.random() * sampleData.religions.length)];
  const caste = sampleData.castes[Math.floor(Math.random() * sampleData.castes.length)];
  const motherTongue = sampleData.motherTongues[Math.floor(Math.random() * sampleData.motherTongues.length)];
  const maritalStatus = sampleData.maritalStatuses[Math.floor(Math.random() * sampleData.maritalStatuses.length)];
  const height = sampleData.heights[Math.floor(Math.random() * sampleData.heights.length)];
  const bodyType = sampleData.bodyTypes[Math.floor(Math.random() * sampleData.bodyTypes.length)];
  const complexion = sampleData.complexions[Math.floor(Math.random() * sampleData.complexions.length)];
  const diet = sampleData.diets[Math.floor(Math.random() * sampleData.diets.length)];
  const drinkingHabits = sampleData.drinkingHabits[Math.floor(Math.random() * sampleData.drinkingHabits.length)];
  const smokingHabits = sampleData.smokingHabits[Math.floor(Math.random() * sampleData.smokingHabits.length)];
  const fitnessLevel = sampleData.fitnessLevels[Math.floor(Math.random() * sampleData.fitnessLevels.length)];
  const familyType = sampleData.familyTypes[Math.floor(Math.random() * sampleData.familyTypes.length)];
  const familyStatus = sampleData.familyStatuses[Math.floor(Math.random() * sampleData.familyStatuses.length)];
  const fatherOccupation = sampleData.fatherOccupations[Math.floor(Math.random() * sampleData.fatherOccupations.length)];
  const motherOccupation = sampleData.motherOccupations[Math.floor(Math.random() * sampleData.motherOccupations.length)];
  const annualIncome = sampleData.annualIncomes[Math.floor(Math.random() * sampleData.annualIncomes.length)];
  const profileImage = sampleData.profileImages[Math.floor(Math.random() * sampleData.profileImages.length)];
  
  // Generate random hobbies (2-5 hobbies)
  const numHobbies = Math.floor(Math.random() * 4) + 2;
  const selectedHobbies = [];
  for (let i = 0; i < numHobbies; i++) {
    const hobby = sampleData.hobbies[Math.floor(Math.random() * sampleData.hobbies.length)];
    if (!selectedHobbies.includes(hobby)) {
      selectedHobbies.push(hobby);
    }
  }

  // Generate random languages (1-3 languages)
  const numLanguages = Math.floor(Math.random() * 3) + 1;
  const selectedLanguages = [];
  for (let i = 0; i < numLanguages; i++) {
    const language = sampleData.motherTongues[Math.floor(Math.random() * sampleData.motherTongues.length)];
    if (!selectedLanguages.includes(language)) {
      selectedLanguages.push(language);
    }
  }

  // Generate random interests (similar to hobbies)
  const numInterests = Math.floor(Math.random() * 4) + 2;
  const selectedInterests = [];
  for (let i = 0; i < numInterests; i++) {
    const interest = sampleData.hobbies[Math.floor(Math.random() * sampleData.hobbies.length)];
    if (!selectedInterests.includes(interest)) {
      selectedInterests.push(interest);
    }
  }

  // Generate random photos (1-5 photos)
  const numPhotos = Math.floor(Math.random() * 5) + 1;
  const photos = [];
  for (let i = 0; i < numPhotos; i++) {
    const photo = sampleData.profileImages[Math.floor(Math.random() * sampleData.profileImages.length)];
    if (!photos.includes(photo)) {
      photos.push(photo);
    }
  }

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
