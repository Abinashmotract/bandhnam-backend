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

// Generate unique phone number
const generateUniquePhone = () => {
  return '98765' + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
};

// Create realistic female profiles that would match a male user
const createFemaleProfiles = () => {
  const profiles = [
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phoneNumber: generateUniquePhone(),
      password: bcrypt.hashSync('password123', 10),
      profileFor: 'self',
      gender: 'female',
      dob: new Date('1995-03-15'),
      state: 'Delhi',
      city: 'New Delhi',
      location: 'New Delhi, Delhi',
      religion: 'Hindu',
      caste: 'Brahmin',
      occupation: 'Software Engineer',
      education: 'B.Tech',
      height: '5\'4"',
      maritalStatus: 'never_married',
      about: 'I am a software engineer who loves technology and enjoys cooking. Looking for a life partner who shares similar values and is family-oriented.',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      profileCompletion: 90,
      preferences: {
        ageRange: { min: 25, max: 32 },
        heightRange: { min: '5\'6"', max: '6\'0"' },
        maritalStatus: 'never_married',
        religion: 'Hindu',
        education: 'B.Tech',
        profession: 'Software Engineer',
        location: 'Patna',
        diet: 'Vegetarian',
        qualities: ['Family Oriented', 'Career Focused', 'Good Looking'],
        dealBreakers: ['Smoking', 'Drinking'],
        educationPref: 'B.Tech',
        occupationPref: ['Software Engineer', 'Doctor', 'Teacher'],
        annualIncomePref: '5-10 Lakh',
        lifestyleExpectations: {
          diet: 'Vegetarian',
          drinking: 'Never',
          smoking: 'Never'
        },
        religionCastePref: 'Hindu',
        locationPref: 'Patna',
        relocation: 'Yes',
        familyOrientation: 'Traditional',
        maritalStatusPref: 'never_married'
      }
    },
    {
      name: 'Kavya Iyer',
      email: 'kavya.iyer@example.com',
      phoneNumber: generateUniquePhone(),
      password: bcrypt.hashSync('password123', 10),
      profileFor: 'self',
      gender: 'female',
      dob: new Date('1996-08-14'),
      state: 'Tamil Nadu',
      city: 'Chennai',
      location: 'Chennai, Tamil Nadu',
      religion: 'Hindu',
      caste: 'Iyer',
      occupation: 'Doctor',
      education: 'MBBS',
      height: '5\'3"',
      maritalStatus: 'never_married',
      about: 'I am a doctor who believes in holistic living and helping others. Looking for a life partner who shares similar values and is caring.',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      profileCompletion: 95,
      preferences: {
        ageRange: { min: 26, max: 33 },
        heightRange: { min: '5\'6"', max: '6\'0"' },
        maritalStatus: 'never_married',
        religion: 'Hindu',
        education: 'B.Tech',
        profession: 'Software Engineer',
        location: 'Patna',
        diet: 'Vegetarian',
        qualities: ['Family Oriented', 'Career Focused', 'Caring'],
        dealBreakers: ['Smoking', 'Drinking'],
        educationPref: 'B.Tech',
        occupationPref: ['Software Engineer', 'Doctor', 'Teacher'],
        annualIncomePref: '5-10 Lakh',
        lifestyleExpectations: {
          diet: 'Vegetarian',
          drinking: 'Never',
          smoking: 'Never'
        },
        religionCastePref: 'Hindu',
        locationPref: 'Patna',
        relocation: 'Yes',
        familyOrientation: 'Traditional',
        maritalStatusPref: 'never_married'
      }
    },
    {
      name: 'Anjali Singh',
      email: 'anjali.singh@example.com',
      phoneNumber: generateUniquePhone(),
      password: bcrypt.hashSync('password123', 10),
      profileFor: 'self',
      gender: 'female',
      dob: new Date('1994-11-10'),
      state: 'Uttar Pradesh',
      city: 'Lucknow',
      location: 'Lucknow, Uttar Pradesh',
      religion: 'Hindu',
      caste: 'Rajput',
      occupation: 'Teacher',
      education: 'B.Ed',
      height: '5\'5"',
      maritalStatus: 'never_married',
      about: 'I am a teacher who loves dancing and yoga. Looking for a life partner who is caring and family-oriented.',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      profileCompletion: 85,
      preferences: {
        ageRange: { min: 27, max: 34 },
        heightRange: { min: '5\'6"', max: '6\'0"' },
        maritalStatus: 'never_married',
        religion: 'Hindu',
        education: 'B.Tech',
        profession: 'Software Engineer',
        location: 'Patna',
        diet: 'Vegetarian',
        qualities: ['Family Oriented', 'Career Focused', 'Caring'],
        dealBreakers: ['Smoking', 'Drinking'],
        educationPref: 'B.Tech',
        occupationPref: ['Software Engineer', 'Doctor', 'Teacher'],
        annualIncomePref: '5-10 Lakh',
        lifestyleExpectations: {
          diet: 'Vegetarian',
          drinking: 'Never',
          smoking: 'Never'
        },
        religionCastePref: 'Hindu',
        locationPref: 'Patna',
        relocation: 'Yes',
        familyOrientation: 'Traditional',
        maritalStatusPref: 'never_married'
      }
    },
    {
      name: 'Sneha Reddy',
      email: 'sneha.reddy@example.com',
      phoneNumber: generateUniquePhone(),
      password: bcrypt.hashSync('password123', 10),
      profileFor: 'self',
      gender: 'female',
      dob: new Date('1993-09-12'),
      state: 'Andhra Pradesh',
      city: 'Hyderabad',
      location: 'Hyderabad, Andhra Pradesh',
      religion: 'Hindu',
      caste: 'Reddy',
      occupation: 'Chartered Accountant',
      education: 'CA',
      height: '5\'2"',
      maritalStatus: 'never_married',
      about: 'I am a chartered accountant who loves cooking and dancing. Looking for a life partner who is honest and caring.',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      profileCompletion: 88,
      preferences: {
        ageRange: { min: 28, max: 35 },
        heightRange: { min: '5\'6"', max: '6\'0"' },
        maritalStatus: 'never_married',
        religion: 'Hindu',
        education: 'B.Tech',
        profession: 'Software Engineer',
        location: 'Patna',
        diet: 'Vegetarian',
        qualities: ['Family Oriented', 'Career Focused', 'Honest'],
        dealBreakers: ['Smoking', 'Drinking'],
        educationPref: 'B.Tech',
        occupationPref: ['Software Engineer', 'Doctor', 'Teacher'],
        annualIncomePref: '5-10 Lakh',
        lifestyleExpectations: {
          diet: 'Vegetarian',
          drinking: 'Never',
          smoking: 'Never'
        },
        religionCastePref: 'Hindu',
        locationPref: 'Patna',
        relocation: 'Yes',
        familyOrientation: 'Traditional',
        maritalStatusPref: 'never_married'
      }
    },
    {
      name: 'Pooja Gupta',
      email: 'pooja.gupta@example.com',
      phoneNumber: generateUniquePhone(),
      password: bcrypt.hashSync('password123', 10),
      profileFor: 'self',
      gender: 'female',
      dob: new Date('1997-12-03'),
      state: 'Punjab',
      city: 'Chandigarh',
      location: 'Chandigarh, Punjab',
      religion: 'Hindu',
      caste: 'Gupta',
      occupation: 'Fashion Designer',
      education: 'B.Des',
      height: '5\'6"',
      maritalStatus: 'never_married',
      about: 'I am a fashion designer who loves creativity and art. Looking for a life partner who appreciates creativity and has a good sense of humor.',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      profileCompletion: 82,
      preferences: {
        ageRange: { min: 24, max: 31 },
        heightRange: { min: '5\'6"', max: '6\'0"' },
        maritalStatus: 'never_married',
        religion: 'Hindu',
        education: 'B.Tech',
        profession: 'Software Engineer',
        location: 'Patna',
        diet: 'Vegetarian',
        qualities: ['Family Oriented', 'Career Focused', 'Creative'],
        dealBreakers: ['Smoking', 'Drinking'],
        educationPref: 'B.Tech',
        occupationPref: ['Software Engineer', 'Doctor', 'Teacher'],
        annualIncomePref: '5-10 Lakh',
        lifestyleExpectations: {
          diet: 'Vegetarian',
          drinking: 'Never',
          smoking: 'Never'
        },
        religionCastePref: 'Hindu',
        locationPref: 'Patna',
        relocation: 'Yes',
        familyOrientation: 'Traditional',
        maritalStatusPref: 'never_married'
      }
    }
  ];

  return profiles;
};

// Update user profile with proper preferences
const updateUserProfile = async () => {
  try {
    await connectDB();

    // Find the user
    const user = await User.findOne({ email: 'abinas@yopmail.com' });
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('Updating user profile with proper preferences...');

    // Update user profile with better data
    user.name = 'Abinash Kumar';
    user.gender = 'male';
    user.dob = new Date('1995-05-15');
    user.state = 'Bihar';
    user.city = 'Patna';
    user.location = 'Patna, Bihar';
    user.religion = 'Hindu';
    user.caste = 'Brahmin';
    user.occupation = 'Software Engineer';
    user.education = 'B.Tech';
    user.height = '5\'8"';
    user.maritalStatus = 'never_married';
    user.about = 'I am a software engineer from Patna, passionate about technology and looking for a life partner who shares similar values. I believe in traditional values and family-oriented relationships.';
    user.isEmailVerified = true;
    user.isPhoneVerified = true;
    user.isActive = true;
    user.profileCompletion = 95;

    // Set comprehensive preferences
    user.preferences = {
      ageRange: { min: 22, max: 30 },
      heightRange: { min: '5\'2"', max: '5\'8"' },
      maritalStatus: 'never_married',
      religion: 'Hindu',
      education: 'B.Tech',
      profession: 'Software Engineer',
      location: 'Patna',
      diet: 'Vegetarian',
      qualities: ['Family Oriented', 'Career Focused', 'Good Looking', 'Well Educated'],
      dealBreakers: ['Smoking', 'Drinking', 'Non-Vegetarian'],
      educationPref: 'B.Tech',
      occupationPref: ['Software Engineer', 'Doctor', 'Teacher', 'Chartered Accountant'],
      annualIncomePref: '5-10 Lakh',
      lifestyleExpectations: {
        diet: 'Vegetarian',
        drinking: 'Never',
        smoking: 'Never'
      },
      religionCastePref: 'Hindu',
      locationPref: 'Patna',
      relocation: 'Yes',
      familyOrientation: 'Traditional',
      maritalStatusPref: 'never_married'
    };

    await user.save();
    console.log('User profile updated successfully');

    // Create female profiles that would match this user
    console.log('Creating matching female profiles...');
    const femaleProfiles = createFemaleProfiles();
    
    // Clear existing female profiles
    await User.deleteMany({ 
      email: { $regex: /@example\.com$/ },
      gender: 'female'
    });

    // Insert new female profiles
    const createdProfiles = await User.insertMany(femaleProfiles);
    console.log(`Created ${createdProfiles.length} matching female profiles`);

    // Display summary
    console.log('\n=== PROFILE SETUP COMPLETE ===');
    console.log('User Profile Updated:');
    console.log(`- Name: ${user.name}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Location: ${user.location}`);
    console.log(`- Occupation: ${user.occupation}`);
    console.log(`- Preferences: Age ${user.preferences.ageRange.min}-${user.preferences.ageRange.max}, Height ${user.preferences.heightRange.min}-${user.preferences.heightRange.max}`);
    
    console.log('\nMatching Profiles Created:');
    createdProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.name} - ${profile.occupation} from ${profile.location}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error setting up user profile:', error);
    process.exit(1);
  }
};

updateUserProfile();
