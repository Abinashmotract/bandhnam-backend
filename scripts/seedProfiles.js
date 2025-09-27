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

// Sample profiles data
const sampleProfiles = [
  {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phoneNumber: "9876543210",
    password: "Password123!",
    profileFor: "self",
    gender: "female",
    dob: "1995-06-15",
    state: "Maharashtra",
    city: "Mumbai",
    location: "Mumbai, Maharashtra",
    religion: "Hindu",
    caste: "Brahmin",
    subCaste: "Saraswat",
    motherTongue: ["Hindi", "Marathi"],
    maritalStatus: "never_married",
    highestQualification: "Masters",
    fieldOfStudy: "Computer Science",
    occupation: "Software Engineer",
    industry: "Technology",
    annualIncome: "10-20",
    education: "Masters",
    height: "5'4\"",
    weight: "55",
    bodyType: "Slim",
    complexion: "Fair",
    diet: "Vegetarian",
    drinkingHabits: "Never",
    smokingHabits: "Never",
    fitnessLevel: "Active",
    hobbies: ["Reading", "Cooking", "Dancing", "Traveling"],
    interests: ["Technology", "Music", "Movies", "Fitness"],
    languagesKnown: ["Hindi", "English", "Marathi"],
    petPreferences: "Dogs",
    about: "I am a software engineer who loves technology and enjoys cooking in my free time. Looking for someone who shares similar values and interests.",
    preferences: {
      ageRange: { min: 28, max: 35 },
      heightRange: { min: "5'6\"", max: "6'0\"" },
      religion: "Hindu",
      caste: "Brahmin",
      education: "Graduate",
      location: "Mumbai",
      maritalStatusPref: "never_married",
      lifestyleExpectations: {
        diet: "Vegetarian",
        drinking: "Never",
        smoking: "Never"
      }
    },
    fatherOccupation: "Government Officer",
    motherOccupation: "Teacher",
    brothers: 1,
    brothersMarried: true,
    sisters: 0,
    sistersMarried: false,
    familyType: "Nuclear",
    familyIncome: "10-20",
    nativePlace: "Pune",
    familyStatus: "Middle Class",
    agreeToTerms: true,
    role: "user"
  },
  {
    name: "Arjun Patel",
    email: "arjun.patel@example.com",
    phoneNumber: "9876543211",
    password: "Password123!",
    profileFor: "self",
    gender: "male",
    dob: "1992-03-22",
    state: "Gujarat",
    city: "Ahmedabad",
    location: "Ahmedabad, Gujarat",
    religion: "Hindu",
    caste: "Patel",
    subCaste: "Leuva Patel",
    motherTongue: ["Gujarati", "Hindi"],
    maritalStatus: "never_married",
    highestQualification: "Masters",
    fieldOfStudy: "Business Administration",
    occupation: "Business Owner",
    industry: "Manufacturing",
    annualIncome: "20+",
    education: "Masters",
    height: "5'10\"",
    weight: "75",
    bodyType: "Athletic",
    complexion: "Wheatish",
    diet: "Vegetarian",
    drinkingHabits: "Occasionally",
    smokingHabits: "Never",
    fitnessLevel: "Very Active",
    hobbies: ["Cricket", "Gym", "Traveling", "Photography"],
    interests: ["Business", "Sports", "Travel", "Technology"],
    languagesKnown: ["Gujarati", "Hindi", "English"],
    petPreferences: "Dogs",
    about: "I am a successful businessman who believes in hard work and family values. Looking for a life partner who can be my best friend and support system.",
    preferences: {
      ageRange: { min: 25, max: 32 },
      heightRange: { min: "5'2\"", max: "5'8\"" },
      religion: "Hindu",
      caste: "Patel",
      education: "Graduate",
      location: "Gujarat",
      maritalStatusPref: "never_married",
      lifestyleExpectations: {
        diet: "Vegetarian",
        drinking: "Occasionally",
        smoking: "Never"
      }
    },
    fatherOccupation: "Businessman",
    motherOccupation: "Homemaker",
    brothers: 0,
    brothersMarried: false,
    sisters: 2,
    sistersMarried: true,
    familyType: "Joint",
    familyIncome: "20+",
    nativePlace: "Rajkot",
    familyStatus: "Upper Middle Class",
    agreeToTerms: true,
    role: "user"
  },
  {
    name: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    phoneNumber: "9876543212",
    password: "Password123!",
    profileFor: "self",
    gender: "female",
    dob: "1994-11-08",
    state: "Telangana",
    city: "Hyderabad",
    location: "Hyderabad, Telangana",
    religion: "Hindu",
    caste: "Reddy",
    subCaste: "Kapu",
    motherTongue: ["Telugu", "Hindi"],
    maritalStatus: "never_married",
    highestQualification: "Masters",
    fieldOfStudy: "Medicine",
    occupation: "Doctor",
    industry: "Healthcare",
    annualIncome: "10-20",
    education: "Masters",
    height: "5'3\"",
    weight: "52",
    bodyType: "Slim",
    complexion: "Fair",
    diet: "Vegetarian",
    drinkingHabits: "Never",
    smokingHabits: "Never",
    fitnessLevel: "Active",
    hobbies: ["Reading", "Classical Dance", "Music", "Cooking"],
    interests: ["Medicine", "Arts", "Culture", "Travel"],
    languagesKnown: ["Telugu", "Hindi", "English"],
    petPreferences: "Cats",
    about: "I am a doctor who is passionate about helping people. I love classical dance and music. Looking for someone who appreciates arts and culture.",
    preferences: {
      ageRange: { min: 28, max: 36 },
      heightRange: { min: "5'6\"", max: "6'2\"" },
      religion: "Hindu",
      caste: "Reddy",
      education: "Graduate",
      location: "Hyderabad",
      maritalStatusPref: "never_married",
      lifestyleExpectations: {
        diet: "Vegetarian",
        drinking: "Never",
        smoking: "Never"
      }
    },
    fatherOccupation: "Doctor",
    motherOccupation: "Teacher",
    brothers: 1,
    brothersMarried: false,
    sisters: 1,
    sistersMarried: true,
    familyType: "Nuclear",
    familyIncome: "10-20",
    nativePlace: "Vijayawada",
    familyStatus: "Upper Middle Class",
    agreeToTerms: true,
    role: "user"
  },
  {
    name: "Rahul Singh",
    email: "rahul.singh@example.com",
    phoneNumber: "9876543213",
    password: "Password123!",
    profileFor: "self",
    gender: "male",
    dob: "1990-08-12",
    state: "Punjab",
    city: "Chandigarh",
    location: "Chandigarh, Punjab",
    religion: "Sikh",
    caste: "Jat",
    subCaste: "Sikh Jat",
    motherTongue: ["Punjabi", "Hindi"],
    maritalStatus: "never_married",
    highestQualification: "Masters",
    fieldOfStudy: "Engineering",
    occupation: "Software Engineer",
    industry: "Technology",
    annualIncome: "10-20",
    education: "Masters",
    height: "5'11\"",
    weight: "78",
    bodyType: "Athletic",
    complexion: "Wheatish",
    diet: "Non-Vegetarian",
    drinkingHabits: "Occasionally",
    smokingHabits: "Never",
    fitnessLevel: "Very Active",
    hobbies: ["Cricket", "Gym", "Music", "Gaming"],
    interests: ["Technology", "Sports", "Music", "Gaming"],
    languagesKnown: ["Punjabi", "Hindi", "English"],
    petPreferences: "Dogs",
    about: "I am a tech enthusiast who loves cricket and music. I believe in living life to the fullest while maintaining strong family values.",
    preferences: {
      ageRange: { min: 25, max: 32 },
      heightRange: { min: "5'2\"", max: "5'8\"" },
      religion: "Sikh",
      caste: "Jat",
      education: "Graduate",
      location: "Punjab",
      maritalStatusPref: "never_married",
      lifestyleExpectations: {
        diet: "Non-Vegetarian",
        drinking: "Occasionally",
        smoking: "Never"
      }
    },
    fatherOccupation: "Farmer",
    motherOccupation: "Homemaker",
    brothers: 1,
    brothersMarried: true,
    sisters: 1,
    sistersMarried: false,
    familyType: "Joint",
    familyIncome: "5-10",
    nativePlace: "Ludhiana",
    familyStatus: "Middle Class",
    agreeToTerms: true,
    role: "user"
  },
  {
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    phoneNumber: "9876543214",
    password: "Password123!",
    profileFor: "self",
    gender: "female",
    dob: "1996-04-18",
    state: "Tamil Nadu",
    city: "Chennai",
    location: "Chennai, Tamil Nadu",
    religion: "Hindu",
    caste: "Iyer",
    subCaste: "Brahmin",
    motherTongue: ["Tamil", "Hindi"],
    maritalStatus: "never_married",
    highestQualification: "Masters",
    fieldOfStudy: "Arts",
    occupation: "Graphic Designer",
    industry: "Creative",
    annualIncome: "5-10",
    education: "Masters",
    height: "5'5\"",
    weight: "58",
    bodyType: "Slim",
    complexion: "Fair",
    diet: "Vegetarian",
    drinkingHabits: "Never",
    smokingHabits: "Never",
    fitnessLevel: "Active",
    hobbies: ["Painting", "Dancing", "Photography", "Traveling"],
    interests: ["Arts", "Design", "Culture", "Travel"],
    languagesKnown: ["Tamil", "Hindi", "English"],
    petPreferences: "Cats",
    about: "I am a creative soul who loves art and design. I enjoy exploring new places and cultures. Looking for someone who appreciates creativity and has a zest for life.",
    preferences: {
      ageRange: { min: 26, max: 34 },
      heightRange: { min: "5'7\"", max: "6'1\"" },
      religion: "Hindu",
      caste: "Iyer",
      education: "Graduate",
      location: "Chennai",
      maritalStatusPref: "never_married",
      lifestyleExpectations: {
        diet: "Vegetarian",
        drinking: "Never",
        smoking: "Never"
      }
    },
    fatherOccupation: "Engineer",
    motherOccupation: "Artist",
    brothers: 0,
    brothersMarried: false,
    sisters: 1,
    sistersMarried: true,
    familyType: "Nuclear",
    familyIncome: "10-20",
    nativePlace: "Coimbatore",
    familyStatus: "Middle Class",
    agreeToTerms: true,
    role: "user"
  },
  {
    name: "Vikram Kumar",
    email: "vikram.kumar@example.com",
    phoneNumber: "9876543215",
    password: "Password123!",
    profileFor: "self",
    gender: "male",
    dob: "1988-12-03",
    state: "Delhi",
    city: "New Delhi",
    location: "New Delhi, Delhi",
    religion: "Hindu",
    caste: "Kumar",
    subCaste: "Rajput",
    motherTongue: ["Hindi", "English"],
    maritalStatus: "divorced",
    highestQualification: "Masters",
    fieldOfStudy: "Finance",
    occupation: "Investment Banker",
    industry: "Finance",
    annualIncome: "20+",
    education: "Masters",
    height: "5'9\"",
    weight: "72",
    bodyType: "Athletic",
    complexion: "Wheatish",
    diet: "Non-Vegetarian",
    drinkingHabits: "Socially",
    smokingHabits: "Never",
    fitnessLevel: "Active",
    hobbies: ["Golf", "Reading", "Traveling", "Wine Tasting"],
    interests: ["Finance", "Travel", "Sports", "Culture"],
    languagesKnown: ["Hindi", "English", "French"],
    petPreferences: "Dogs",
    about: "I am a successful investment banker who enjoys the finer things in life. I believe in work-life balance and looking for someone who shares similar values.",
    preferences: {
      ageRange: { min: 28, max: 38 },
      heightRange: { min: "5'3\"", max: "5'9\"" },
      religion: "Hindu",
      caste: "Rajput",
      education: "Graduate",
      location: "Delhi",
      maritalStatusPref: "divorced",
      lifestyleExpectations: {
        diet: "Non-Vegetarian",
        drinking: "Socially",
        smoking: "Never"
      }
    },
    fatherOccupation: "Businessman",
    motherOccupation: "Homemaker",
    brothers: 1,
    brothersMarried: true,
    sisters: 0,
    sistersMarried: false,
    familyType: "Nuclear",
    familyIncome: "20+",
    nativePlace: "Jaipur",
    familyStatus: "Upper Class",
    agreeToTerms: true,
    role: "user"
  },
  {
    name: "Kavya Nair",
    email: "kavya.nair@example.com",
    phoneNumber: "9876543216",
    password: "Password123!",
    profileFor: "self",
    gender: "female",
    dob: "1993-09-25",
    state: "Kerala",
    city: "Kochi",
    location: "Kochi, Kerala",
    religion: "Hindu",
    caste: "Nair",
    subCaste: "Nair",
    motherTongue: ["Malayalam", "Hindi"],
    maritalStatus: "never_married",
    highestQualification: "Masters",
    fieldOfStudy: "Literature",
    occupation: "Content Writer",
    industry: "Media",
    annualIncome: "5-10",
    education: "Masters",
    height: "5'2\"",
    weight: "50",
    bodyType: "Slim",
    complexion: "Fair",
    diet: "Vegetarian",
    drinkingHabits: "Never",
    smokingHabits: "Never",
    fitnessLevel: "Active",
    hobbies: ["Writing", "Reading", "Classical Music", "Yoga"],
    interests: ["Literature", "Music", "Spirituality", "Nature"],
    languagesKnown: ["Malayalam", "Hindi", "English", "Sanskrit"],
    petPreferences: "Cats",
    about: "I am a writer who finds joy in words and stories. I practice yoga and meditation regularly. Looking for someone who values inner peace and intellectual conversations.",
    preferences: {
      ageRange: { min: 28, max: 36 },
      heightRange: { min: "5'6\"", max: "6'0\"" },
      religion: "Hindu",
      caste: "Nair",
      education: "Graduate",
      location: "Kerala",
      maritalStatusPref: "never_married",
      lifestyleExpectations: {
        diet: "Vegetarian",
        drinking: "Never",
        smoking: "Never"
      }
    },
    fatherOccupation: "Teacher",
    motherOccupation: "Writer",
    brothers: 0,
    brothersMarried: false,
    sisters: 2,
    sistersMarried: true,
    familyType: "Nuclear",
    familyIncome: "5-10",
    nativePlace: "Thiruvananthapuram",
    familyStatus: "Middle Class",
    agreeToTerms: true,
    role: "user"
  },
  {
    name: "Amit Jain",
    email: "amit.jain@example.com",
    phoneNumber: "9876543217",
    password: "Password123!",
    profileFor: "self",
    gender: "male",
    dob: "1991-01-14",
    state: "Rajasthan",
    city: "Jaipur",
    location: "Jaipur, Rajasthan",
    religion: "Jain",
    caste: "Jain",
    subCaste: "Digambar",
    motherTongue: ["Hindi", "Rajasthani"],
    maritalStatus: "never_married",
    highestQualification: "Masters",
    fieldOfStudy: "Commerce",
    occupation: "Chartered Accountant",
    industry: "Finance",
    annualIncome: "10-20",
    education: "Masters",
    height: "5'8\"",
    weight: "70",
    bodyType: "Average",
    complexion: "Wheatish",
    diet: "Vegetarian",
    drinkingHabits: "Never",
    smokingHabits: "Never",
    fitnessLevel: "Moderate",
    hobbies: ["Chess", "Reading", "Meditation", "Traveling"],
    interests: ["Finance", "Spirituality", "Chess", "Travel"],
    languagesKnown: ["Hindi", "English", "Rajasthani"],
    petPreferences: "None",
    about: "I am a CA who believes in simple living and high thinking. I follow Jain principles and practice meditation. Looking for someone who shares similar values and beliefs.",
    preferences: {
      ageRange: { min: 25, max: 32 },
      heightRange: { min: "5'2\"", max: "5'7\"" },
      religion: "Jain",
      caste: "Jain",
      education: "Graduate",
      location: "Rajasthan",
      maritalStatusPref: "never_married",
      lifestyleExpectations: {
        diet: "Vegetarian",
        drinking: "Never",
        smoking: "Never"
      }
    },
    fatherOccupation: "Businessman",
    motherOccupation: "Homemaker",
    brothers: 1,
    brothersMarried: false,
    sisters: 1,
    sistersMarried: true,
    familyType: "Joint",
    familyIncome: "10-20",
    nativePlace: "Udaipur",
    familyStatus: "Middle Class",
    agreeToTerms: true,
    role: "user"
  },
  {
    name: "Pooja Gupta",
    email: "pooja.gupta@example.com",
    phoneNumber: "9876543218",
    password: "Password123!",
    profileFor: "self",
    gender: "female",
    dob: "1995-07-30",
    state: "Uttar Pradesh",
    city: "Lucknow",
    location: "Lucknow, Uttar Pradesh",
    religion: "Hindu",
    caste: "Gupta",
    subCaste: "Vaishya",
    motherTongue: ["Hindi", "Awadhi"],
    maritalStatus: "never_married",
    highestQualification: "Masters",
    fieldOfStudy: "Education",
    occupation: "Teacher",
    industry: "Education",
    annualIncome: "5-10",
    education: "Masters",
    height: "5'4\"",
    weight: "56",
    bodyType: "Slim",
    complexion: "Fair",
    diet: "Vegetarian",
    drinkingHabits: "Never",
    smokingHabits: "Never",
    fitnessLevel: "Active",
    hobbies: ["Teaching", "Cooking", "Gardening", "Reading"],
    interests: ["Education", "Cooking", "Nature", "Literature"],
    languagesKnown: ["Hindi", "English", "Awadhi"],
    petPreferences: "Dogs",
    about: "I am a teacher who is passionate about education and nurturing young minds. I love cooking and gardening. Looking for someone who values education and family.",
    preferences: {
      ageRange: { min: 28, max: 35 },
      heightRange: { min: "5'6\"", max: "6'0\"" },
      religion: "Hindu",
      caste: "Gupta",
      education: "Graduate",
      location: "Uttar Pradesh",
      maritalStatusPref: "never_married",
      lifestyleExpectations: {
        diet: "Vegetarian",
        drinking: "Never",
        smoking: "Never"
      }
    },
    fatherOccupation: "Teacher",
    motherOccupation: "Teacher",
    brothers: 1,
    brothersMarried: true,
    sisters: 1,
    sistersMarried: false,
    familyType: "Nuclear",
    familyIncome: "5-10",
    nativePlace: "Varanasi",
    familyStatus: "Middle Class",
    agreeToTerms: true,
    role: "user"
  }
];

// Function to hash passwords
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Function to seed profiles
const seedProfiles = async () => {
  try {
    await connectDB();
    
    console.log("Starting to seed profiles...");
    
    // Clear existing users (optional - remove this if you want to keep existing data)
    // await User.deleteMany({ role: "user" });
    
    let createdCount = 0;
    
    for (const profileData of sampleProfiles) {
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
    
    console.log(`\n🎉 Seeding completed! Created ${createdCount} new profiles.`);
    
    // Display summary
    const totalUsers = await User.countDocuments({ role: "user" });
    console.log(`📊 Total users in database: ${totalUsers}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

// Run the seeding function
seedProfiles();
