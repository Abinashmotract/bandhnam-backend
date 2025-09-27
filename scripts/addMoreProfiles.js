import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bandhnam");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

// Additional diverse profiles
const additionalProfiles = [
  {
    name: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    phoneNumber: "9876543219",
    password: "Password123!",
    profileFor: "self",
    gender: "male",
    dob: "1985-05-20",
    state: "Bihar",
    city: "Patna",
    location: "Patna, Bihar",
    religion: "Hindu",
    caste: "Kumar",
    subCaste: "Kurmi",
    motherTongue: ["Hindi", "Bhojpuri"],
    maritalStatus: "widower",
    highestQualification: "Graduate",
    fieldOfStudy: "Engineering",
    occupation: "Government Officer",
    industry: "Government",
    annualIncome: "10-20",
    education: "Graduate",
    height: "5'7\"",
    weight: "68",
    bodyType: "Average",
    complexion: "Wheatish",
    diet: "Vegetarian",
    drinkingHabits: "Never",
    smokingHabits: "Never",
    fitnessLevel: "Moderate",
    hobbies: ["Reading", "Gardening", "Cricket"],
    interests: ["Politics", "Social Work", "Sports"],
    languagesKnown: ["Hindi", "English", "Bhojpuri"],
    petPreferences: "Dogs",
    about: "I am a government officer who believes in serving the society. I lost my wife in an accident and now looking for a caring life partner.",
    preferences: {
      ageRange: { min: 30, max: 40 },
      heightRange: { min: "5'2\"", max: "5'8\"" },
      religion: "Hindu",
      caste: "Kurmi",
      education: "Graduate",
      location: "Bihar",
      maritalStatusPref: "widow",
      lifestyleExpectations: {
        diet: "Vegetarian",
        drinking: "Never",
        smoking: "Never"
      }
    },
    fatherOccupation: "Farmer",
    motherOccupation: "Homemaker",
    brothers: 2,
    brothersMarried: true,
    sisters: 1,
    sistersMarried: true,
    familyType: "Joint",
    familyIncome: "5-10",
    nativePlace: "Gaya",
    familyStatus: "Middle Class",
    agreeToTerms: true,
    role: "user"
  },
  {
    name: "Sunita Devi",
    email: "sunita.devi@example.com",
    phoneNumber: "9876543220",
    password: "Password123!",
    profileFor: "self",
    gender: "female",
    dob: "1987-12-10",
    state: "Haryana",
    city: "Gurgaon",
    location: "Gurgaon, Haryana",
    religion: "Hindu",
    caste: "Jat",
    subCaste: "Jat",
    motherTongue: ["Hindi", "Haryanvi"],
    maritalStatus: "divorced",
    highestQualification: "Masters",
    fieldOfStudy: "Management",
    occupation: "HR Manager",
    industry: "Corporate",
    annualIncome: "10-20",
    education: "Masters",
    height: "5'6\"",
    weight: "62",
    bodyType: "Slim",
    complexion: "Fair",
    diet: "Vegetarian",
    drinkingHabits: "Never",
    smokingHabits: "Never",
    fitnessLevel: "Active",
    hobbies: ["Yoga", "Cooking", "Reading", "Traveling"],
    interests: ["Management", "Wellness", "Travel", "Culture"],
    languagesKnown: ["Hindi", "English", "Haryanvi"],
    petPreferences: "Cats",
    about: "I am an HR professional who believes in work-life balance. I went through a difficult divorce and now looking for someone who understands and respects women.",
    preferences: {
      ageRange: { min: 32, max: 42 },
      heightRange: { min: "5'8\"", max: "6'2\"" },
      religion: "Hindu",
      caste: "Jat",
      education: "Graduate",
      location: "Haryana",
      maritalStatusPref: "divorced",
      lifestyleExpectations: {
        diet: "Vegetarian",
        drinking: "Never",
        smoking: "Never"
      }
    },
    fatherOccupation: "Farmer",
    motherOccupation: "Teacher",
    brothers: 1,
    brothersMarried: true,
    sisters: 0,
    sistersMarried: false,
    familyType: "Nuclear",
    familyIncome: "10-20",
    nativePlace: "Rohtak",
    familyStatus: "Middle Class",
    agreeToTerms: true,
    role: "user"
  },
  {
    name: "Mohammed Ali",
    email: "mohammed.ali@example.com",
    phoneNumber: "9876543221",
    password: "Password123!",
    profileFor: "self",
    gender: "male",
    dob: "1993-02-28",
    state: "Karnataka",
    city: "Bangalore",
    location: "Bangalore, Karnataka",
    religion: "Muslim",
    caste: "Muslim",
    subCaste: "Sunni",
    motherTongue: ["Urdu", "Hindi"],
    maritalStatus: "never_married",
    highestQualification: "Masters",
    fieldOfStudy: "Computer Science",
    occupation: "Data Scientist",
    industry: "Technology",
    annualIncome: "10-20",
    education: "Masters",
    height: "5'9\"",
    weight: "74",
    bodyType: "Athletic",
    complexion: "Wheatish",
    diet: "Non-Vegetarian",
    drinkingHabits: "Never",
    smokingHabits: "Never",
    fitnessLevel: "Very Active",
    hobbies: ["Cricket", "Gym", "Reading", "Cooking"],
    interests: ["Technology", "Sports", "Science", "Travel"],
    languagesKnown: ["Urdu", "Hindi", "English", "Kannada"],
    petPreferences: "Dogs",
    about: "I am a data scientist who loves technology and sports. I follow Islamic principles and looking for a life partner who shares similar values.",
    preferences: {
      ageRange: { min: 25, max: 32 },
      heightRange: { min: "5'2\"", max: "5'8\"" },
      religion: "Muslim",
      caste: "Muslim",
      education: "Graduate",
      location: "Karnataka",
      maritalStatusPref: "never_married",
      lifestyleExpectations: {
        diet: "Non-Vegetarian",
        drinking: "Never",
        smoking: "Never"
      }
    },
    fatherOccupation: "Businessman",
    motherOccupation: "Homemaker",
    brothers: 1,
    brothersMarried: false,
    sisters: 2,
    sistersMarried: true,
    familyType: "Joint",
    familyIncome: "10-20",
    nativePlace: "Mysore",
    familyStatus: "Middle Class",
    agreeToTerms: true,
    role: "user"
  },
  {
    name: "Priyanka Mehta",
    email: "priyanka.mehta@example.com",
    phoneNumber: "9876543222",
    password: "Password123!",
    profileFor: "self",
    gender: "female",
    dob: "1994-06-15",
    state: "Gujarat",
    city: "Surat",
    location: "Surat, Gujarat",
    religion: "Hindu",
    caste: "Mehta",
    subCaste: "Baniya",
    motherTongue: ["Gujarati", "Hindi"],
    maritalStatus: "never_married",
    highestQualification: "Masters",
    fieldOfStudy: "Commerce",
    occupation: "Chartered Accountant",
    industry: "Finance",
    annualIncome: "10-20",
    education: "Masters",
    height: "5'3\"",
    weight: "54",
    bodyType: "Slim",
    complexion: "Fair",
    diet: "Vegetarian",
    drinkingHabits: "Never",
    smokingHabits: "Never",
    fitnessLevel: "Active",
    hobbies: ["Dancing", "Cooking", "Shopping", "Movies"],
    interests: ["Finance", "Fashion", "Entertainment", "Travel"],
    languagesKnown: ["Gujarati", "Hindi", "English"],
    petPreferences: "Dogs",
    about: "I am a CA who loves dancing and fashion. I enjoy shopping and watching movies. Looking for someone who can be my best friend and life partner.",
    preferences: {
      ageRange: { min: 28, max: 35 },
      heightRange: { min: "5'7\"", max: "6'1\"" },
      religion: "Hindu",
      caste: "Baniya",
      education: "Graduate",
      location: "Gujarat",
      maritalStatusPref: "never_married",
      lifestyleExpectations: {
        diet: "Vegetarian",
        drinking: "Never",
        smoking: "Never"
      }
    },
    fatherOccupation: "Businessman",
    motherOccupation: "Homemaker",
    brothers: 0,
    brothersMarried: false,
    sisters: 1,
    sistersMarried: true,
    familyType: "Nuclear",
    familyIncome: "10-20",
    nativePlace: "Vadodara",
    familyStatus: "Upper Middle Class",
    agreeToTerms: true,
    role: "user"
  },
  {
    name: "Suresh Reddy",
    email: "suresh.reddy@example.com",
    phoneNumber: "9876543223",
    password: "Password123!",
    profileFor: "self",
    gender: "male",
    dob: "1989-11-22",
    state: "Andhra Pradesh",
    city: "Vijayawada",
    location: "Vijayawada, Andhra Pradesh",
    religion: "Hindu",
    caste: "Reddy",
    subCaste: "Kapu",
    motherTongue: ["Telugu", "Hindi"],
    maritalStatus: "never_married",
    highestQualification: "Masters",
    fieldOfStudy: "Agriculture",
    occupation: "Agricultural Engineer",
    industry: "Agriculture",
    annualIncome: "5-10",
    education: "Masters",
    height: "5'8\"",
    weight: "70",
    bodyType: "Average",
    complexion: "Wheatish",
    diet: "Non-Vegetarian",
    drinkingHabits: "Occasionally",
    smokingHabits: "Never",
    fitnessLevel: "Moderate",
    hobbies: ["Farming", "Cricket", "Music", "Traveling"],
    interests: ["Agriculture", "Sports", "Music", "Nature"],
    languagesKnown: ["Telugu", "Hindi", "English"],
    petPreferences: "Dogs",
    about: "I am an agricultural engineer who loves farming and nature. I believe in sustainable agriculture and looking for someone who appreciates rural life and values.",
    preferences: {
      ageRange: { min: 26, max: 34 },
      heightRange: { min: "5'2\"", max: "5'8\"" },
      religion: "Hindu",
      caste: "Reddy",
      education: "Graduate",
      location: "Andhra Pradesh",
      maritalStatusPref: "never_married",
      lifestyleExpectations: {
        diet: "Non-Vegetarian",
        drinking: "Occasionally",
        smoking: "Never"
      }
    },
    fatherOccupation: "Farmer",
    motherOccupation: "Homemaker",
    brothers: 2,
    brothersMarried: true,
    sisters: 1,
    sistersMarried: false,
    familyType: "Joint",
    familyIncome: "5-10",
    nativePlace: "Guntur",
    familyStatus: "Middle Class",
    agreeToTerms: true,
    role: "user"
  }
];

// Function to hash passwords
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Function to add more profiles
const addMoreProfiles = async () => {
  try {
    await connectDB();
    
    console.log("Adding more diverse profiles...");
    
    let createdCount = 0;
    
    for (const profileData of additionalProfiles) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [
            { email: profileData.email },
            { phoneNumber: profileData.phoneNumber }
          ]
        });
        
        if (existingUser) {
          console.log(`User with email ${profileData.email} or phone ${profileData.phoneNumber} already exists, skipping...`);
          continue;
        }
        
        // Hash password
        const hashedPassword = await hashPassword(profileData.password);
        profileData.password = hashedPassword;
        
        // Create user
        const user = await User.create(profileData);
        createdCount++;
        
        console.log(`✅ Created profile: ${user.name} (${user.email})`);
      } catch (error) {
        console.error(`❌ Error creating profile ${profileData.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Additional profiles added! Created ${createdCount} new profiles.`);
    
    // Display summary
    const totalUsers = await User.countDocuments({ role: "user" });
    console.log(`📊 Total users in database: ${totalUsers}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding profiles:", error);
    process.exit(1);
  }
};

// Run the function
addMoreProfiles();
