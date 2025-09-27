import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

// Import models
import User from "../models/User.js";
import Horoscope from "../models/Horoscope.js";
import SuccessStory from "../models/SuccessStory.js";
import Blog from "../models/Blog.js";
import ProfileAnalytics from "../models/ProfileAnalytics.js";
import Interaction from "../models/Interaction.js";
import MembershipPlan from "../models/MembershipPlan.js";
import UserMembership from "../models/UserMembership.js";
import Notification from "../models/Notification.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const createMembershipPlans = async () => {
  console.log("Creating membership plans...");
  
  // Check if plans already exist
  const existingPlans = await MembershipPlan.countDocuments();
  if (existingPlans > 0) {
    console.log("Membership plans already exist, skipping creation");
    return;
  }
  
  const plans = [
    {
      name: "Basic",
      price: 0,
      duration: "monthly",
      features: [
        "View 5 profiles per day",
        "Basic search filters",
        "Send 3 interests per day",
        "Basic profile visibility"
      ],
      description: "Perfect for getting started",
      isPopular: false,
      isActive: true
    },
    {
      name: "Premium",
      price: 999,
      duration: "monthly",
      features: [
        "Unlimited profile views",
        "Advanced search filters",
        "Unlimited interests",
        "Priority customer support",
        "Profile boost",
        "Advanced matching algorithm",
        "View who visited your profile"
      ],
      description: "Most popular choice",
      isPopular: true,
      isActive: true
    },
    {
      name: "Elite",
      price: 1999,
      duration: "monthly",
      features: [
        "All Premium features",
        "Horoscope matching",
        "Profile verification badge",
        "Advanced analytics",
        "Priority listing",
        "Dedicated relationship manager",
        "Unlimited super likes",
        "Advanced privacy controls"
      ],
      description: "For serious matrimonial seekers",
      isPopular: false,
      isActive: true
    }
  ];

  await MembershipPlan.insertMany(plans);
  console.log("Membership plans created successfully");
};

const createTestUsers = async () => {
  console.log("Creating test users...");
  
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const users = [
    // Female Users
    {
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phoneNumber: "9876543210",
      password: hashedPassword,
      profileFor: "self",
      gender: "female",
      dob: new Date("1995-03-15"),
      state: "Delhi",
      city: "New Delhi",
      location: "New Delhi, Delhi",
      religion: "Hindu",
      caste: "Brahmin",
      subCaste: "Kashmiri Pandit",
      motherTongue: ["Hindi", "English"],
      maritalStatus: "never_married",
      highestQualification: "Master's",
      fieldOfStudy: "Computer Science",
      occupation: "Software Engineer",
      industry: "Technology",
      annualIncome: "5-10",
      education: "MTech",
      height: "5'4\"",
      weight: "55",
      bodyType: "Average",
      complexion: "Fair",
      diet: "Vegetarian",
      drinkingHabits: "Never",
      smokingHabits: "Never",
      fitnessLevel: "Regular",
      hobbies: ["Reading", "Cooking", "Travel"],
      interests: ["Technology", "Music", "Movies"],
      languagesKnown: ["Hindi", "English", "Sanskrit"],
      about: "I am a software engineer who loves technology and enjoys cooking. Looking for a life partner who shares similar values.",
      profileImage: "profileImage-1749710531066-793879098.webp",
      photos: ["photos-1756966843060-914643708.avif"],
      agreeToTerms: true,
      isOtpVerified: true,
      preferences: {
        ageRange: { min: 28, max: 35 },
        height: "5'6\" - 6'0\"",
        maritalStatus: "Never Married",
        religion: "Hindu",
        education: "Master's",
        profession: "Engineer",
        location: "Delhi",
        diet: "Vegetarian"
      }
    },
    {
      name: "Anjali Singh",
      email: "anjali.singh@example.com",
      phoneNumber: "9876543211",
      password: hashedPassword,
      profileFor: "self",
      gender: "female",
      dob: new Date("1994-11-10"),
      state: "Delhi",
      city: "New Delhi",
      location: "New Delhi, Delhi",
      religion: "Hindu",
      caste: "Rajput",
      subCaste: "Khatri",
      motherTongue: ["Hindi", "English"],
      maritalStatus: "never_married",
      highestQualification: "Master's",
      fieldOfStudy: "Medicine",
      occupation: "Doctor",
      industry: "Healthcare",
      annualIncome: "10-20",
      education: "MBBS",
      height: "5'5\"",
      weight: "52",
      bodyType: "Slim",
      complexion: "Fair",
      diet: "Vegetarian",
      drinkingHabits: "Never",
      smokingHabits: "Never",
      fitnessLevel: "Regular",
      hobbies: ["Dancing", "Reading", "Yoga"],
      interests: ["Medicine", "Dance", "Yoga"],
      languagesKnown: ["Hindi", "English", "Sanskrit"],
      about: "I am a doctor who loves dancing and yoga. Looking for a life partner who is caring and family-oriented.",
      profileImage: "profileImage-1757270508991-206006177.jpg",
      photos: ["photos-1756967138386-585247217.jpeg"],
      agreeToTerms: true,
      isOtpVerified: true,
      preferences: {
        ageRange: { min: 28, max: 38 },
        height: "5'8\" - 6'2\"",
        maritalStatus: "Never Married",
        religion: "Hindu",
        education: "Graduate",
        profession: "Any",
        location: "Delhi",
        diet: "Vegetarian"
      }
    },
    {
      name: "Sneha Reddy",
      email: "sneha.reddy@example.com",
      phoneNumber: "9876543212",
      password: hashedPassword,
      profileFor: "self",
      gender: "female",
      dob: new Date("1993-09-12"),
      state: "Delhi",
      city: "New Delhi",
      location: "New Delhi, Delhi",
      religion: "Hindu",
      caste: "Reddy",
      subCaste: "Telugu",
      motherTongue: ["Telugu", "Hindi", "English"],
      maritalStatus: "never_married",
      highestQualification: "Master's",
      fieldOfStudy: "Commerce",
      occupation: "Chartered Accountant",
      industry: "Finance",
      annualIncome: "8-15",
      education: "CA",
      height: "5'3\"",
      weight: "50",
      bodyType: "Slim",
      complexion: "Fair",
      diet: "Vegetarian",
      drinkingHabits: "Never",
      smokingHabits: "Never",
      fitnessLevel: "Regular",
      hobbies: ["Cooking", "Reading", "Dancing"],
      interests: ["Finance", "Cooking", "Dance"],
      languagesKnown: ["Telugu", "Hindi", "English"],
      about: "I am a chartered accountant who loves cooking and dancing. Looking for a life partner who is honest and caring.",
      profileImage: "profileImage-1749710531066-793879098.webp",
      photos: ["photos-1756966843060-914643708.avif"],
      agreeToTerms: true,
      isOtpVerified: true,
      preferences: {
        ageRange: { min: 28, max: 35 },
        height: "5'6\" - 6'0\"",
        maritalStatus: "Never Married",
        religion: "Hindu",
        education: "Graduate",
        profession: "Any",
        location: "Delhi",
        diet: "Vegetarian"
      }
    },
    // Male Users
    {
      name: "Rahul Kumar",
      email: "rahul.kumar@example.com",
      phoneNumber: "9876543213",
      password: hashedPassword,
      profileFor: "self",
      gender: "male",
      dob: new Date("1992-07-20"),
      state: "Delhi",
      city: "New Delhi",
      location: "New Delhi, Delhi",
      religion: "Hindu",
      caste: "Brahmin",
      subCaste: "Kashmiri Pandit",
      motherTongue: ["Hindi", "English"],
      maritalStatus: "never_married",
      highestQualification: "Master's",
      fieldOfStudy: "Business Administration",
      occupation: "Business Analyst",
      industry: "Finance",
      annualIncome: "8-15",
      education: "MBA",
      height: "5'10\"",
      weight: "70",
      bodyType: "Average",
      complexion: "Fair",
      diet: "Vegetarian",
      drinkingHabits: "Occasionally",
      smokingHabits: "Never",
      fitnessLevel: "Regular",
      hobbies: ["Cricket", "Reading", "Travel"],
      interests: ["Business", "Sports", "Music"],
      languagesKnown: ["Hindi", "English", "Punjabi"],
      about: "I am a business analyst with a passion for cricket and travel. Looking for a life partner who is understanding and supportive.",
      profileImage: "profileImage-1757270160698-605352629.jpg",
      photos: ["photos-1756967138381-738879547.avif"],
      agreeToTerms: true,
      isOtpVerified: true,
      preferences: {
        ageRange: { min: 25, max: 32 },
        height: "5'2\" - 5'6\"",
        maritalStatus: "Never Married",
        religion: "Hindu",
        education: "Graduate",
        profession: "Any",
        location: "Delhi",
        diet: "Vegetarian"
      }
    },
    {
      name: "Vikram Patel",
      email: "vikram.patel@example.com",
      phoneNumber: "9876543214",
      password: hashedPassword,
      profileFor: "self",
      gender: "male",
      dob: new Date("1990-05-25"),
      state: "Delhi",
      city: "New Delhi",
      location: "New Delhi, Delhi",
      religion: "Hindu",
      caste: "Patel",
      subCaste: "Gujarati",
      motherTongue: ["Gujarati", "Hindi", "English"],
      maritalStatus: "never_married",
      highestQualification: "Master's",
      fieldOfStudy: "Engineering",
      occupation: "Software Engineer",
      industry: "Technology",
      annualIncome: "12-20",
      education: "MTech",
      height: "5'11\"",
      weight: "75",
      bodyType: "Average",
      complexion: "Wheatish",
      diet: "Vegetarian",
      drinkingHabits: "Never",
      smokingHabits: "Never",
      fitnessLevel: "Regular",
      hobbies: ["Cricket", "Music", "Travel"],
      interests: ["Technology", "Sports", "Music"],
      languagesKnown: ["Gujarati", "Hindi", "English"],
      about: "I am a software engineer who loves cricket and music. Looking for a life partner who is understanding and family-oriented.",
      profileImage: "profileImage-1758305645608-133956442.jpeg",
      photos: ["photos-1757266563255-53836263.jpg"],
      agreeToTerms: true,
      isOtpVerified: true,
      preferences: {
        ageRange: { min: 25, max: 30 },
        height: "5'3\" - 5'7\"",
        maritalStatus: "Never Married",
        religion: "Hindu",
        education: "Graduate",
        profession: "Any",
        location: "Delhi",
        diet: "Vegetarian"
      }
    }
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} test users`);
  return createdUsers;
};

const createMoreUsers = async () => {
  console.log("Creating additional users...");
  
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const additionalUsers = [
    // More Female Users
    {
      name: "Kavya Iyer",
      email: "kavya.iyer@example.com",
      phoneNumber: "9876543215",
      password: hashedPassword,
      profileFor: "self",
      gender: "female",
      dob: new Date("1996-08-14"),
      state: "Delhi",
      city: "New Delhi",
      location: "New Delhi, Delhi",
      religion: "Hindu",
      caste: "Iyer",
      subCaste: "Tamil Brahmin",
      motherTongue: ["Tamil", "Hindi", "English"],
      maritalStatus: "never_married",
      highestQualification: "Master's",
      fieldOfStudy: "Psychology",
      occupation: "Psychologist",
      industry: "Healthcare",
      annualIncome: "6-12",
      education: "MSc",
      height: "5'2\"",
      weight: "48",
      bodyType: "Slim",
      complexion: "Fair",
      diet: "Vegetarian",
      drinkingHabits: "Never",
      smokingHabits: "Never",
      fitnessLevel: "Regular",
      hobbies: ["Reading", "Meditation", "Cooking"],
      interests: ["Psychology", "Spirituality", "Wellness"],
      languagesKnown: ["Tamil", "Hindi", "English"],
      about: "I am a psychologist who believes in holistic living. Looking for a life partner who shares similar values.",
      profileImage: "profileImage-1749710531066-793879098.webp",
      photos: ["photos-1756966843060-914643708.avif"],
      agreeToTerms: true,
      isOtpVerified: true,
      preferences: {
        ageRange: { min: 26, max: 34 },
        height: "5'6\" - 6'0\"",
        maritalStatus: "Never Married",
        religion: "Hindu",
        education: "Graduate",
        profession: "Any",
        location: "Delhi",
        diet: "Vegetarian"
      }
    },
    {
      name: "Pooja Gupta",
      email: "pooja.gupta@example.com",
      phoneNumber: "9876543216",
      password: hashedPassword,
      profileFor: "self",
      gender: "female",
      dob: new Date("1997-12-03"),
      state: "Delhi",
      city: "New Delhi",
      location: "New Delhi, Delhi",
      religion: "Hindu",
      caste: "Gupta",
      subCaste: "Vaishya",
      motherTongue: ["Hindi", "English"],
      maritalStatus: "never_married",
      highestQualification: "Master's",
      fieldOfStudy: "Fashion Design",
      occupation: "Fashion Designer",
      industry: "Fashion",
      annualIncome: "4-8",
      education: "MDes",
      height: "5'6\"",
      weight: "54",
      bodyType: "Average",
      complexion: "Fair",
      diet: "Vegetarian",
      drinkingHabits: "Never",
      smokingHabits: "Never",
      fitnessLevel: "Regular",
      hobbies: ["Designing", "Painting", "Dancing"],
      interests: ["Fashion", "Art", "Design"],
      languagesKnown: ["Hindi", "English"],
      about: "I am a fashion designer who loves creativity and art. Looking for a life partner who appreciates creativity.",
      profileImage: "profileImage-1757270508991-206006177.jpg",
      photos: ["photos-1756967138386-585247217.jpeg"],
      agreeToTerms: true,
      isOtpVerified: true,
      preferences: {
        ageRange: { min: 25, max: 32 },
        height: "5'8\" - 6'2\"",
        maritalStatus: "Never Married",
        religion: "Hindu",
        education: "Graduate",
        profession: "Any",
        location: "Delhi",
        diet: "Vegetarian"
      }
    },
    // More Male Users
    {
      name: "Arjun Singh",
      email: "arjun.singh@example.com",
      phoneNumber: "9876543217",
      password: hashedPassword,
      profileFor: "self",
      gender: "male",
      dob: new Date("1991-04-18"),
      state: "Delhi",
      city: "New Delhi",
      location: "New Delhi, Delhi",
      religion: "Hindu",
      caste: "Rajput",
      subCaste: "Khatri",
      motherTongue: ["Hindi", "English"],
      maritalStatus: "never_married",
      highestQualification: "Master's",
      fieldOfStudy: "Law",
      occupation: "Lawyer",
      industry: "Legal",
      annualIncome: "15-25",
      education: "LLM",
      height: "5'9\"",
      weight: "72",
      bodyType: "Average",
      complexion: "Wheatish",
      diet: "Non-Vegetarian",
      drinkingHabits: "Occasionally",
      smokingHabits: "Never",
      fitnessLevel: "Regular",
      hobbies: ["Reading", "Tennis", "Travel"],
      interests: ["Law", "Politics", "Sports"],
      languagesKnown: ["Hindi", "English", "Sanskrit"],
      about: "I am a lawyer who believes in justice and truth. Looking for a life partner who shares similar values.",
      profileImage: "profileImage-1757270160698-605352629.jpg",
      photos: ["photos-1756967138381-738879547.avif"],
      agreeToTerms: true,
      isOtpVerified: true,
      preferences: {
        ageRange: { min: 25, max: 30 },
        height: "5'3\" - 5'7\"",
        maritalStatus: "Never Married",
        religion: "Hindu",
        education: "Graduate",
        profession: "Any",
        location: "Delhi",
        diet: "Any"
      }
    },
    {
      name: "Rohit Agarwal",
      email: "rohit.agarwal@example.com",
      phoneNumber: "9876543218",
      password: hashedPassword,
      profileFor: "self",
      gender: "male",
      dob: new Date("1989-11-22"),
      state: "Delhi",
      city: "New Delhi",
      location: "New Delhi, Delhi",
      religion: "Hindu",
      caste: "Agarwal",
      subCaste: "Vaishya",
      motherTongue: ["Hindi", "English"],
      maritalStatus: "never_married",
      highestQualification: "Master's",
      fieldOfStudy: "Business Administration",
      occupation: "Entrepreneur",
      industry: "Business",
      annualIncome: "20+",
      education: "MBA",
      height: "5'8\"",
      weight: "68",
      bodyType: "Average",
      complexion: "Fair",
      diet: "Vegetarian",
      drinkingHabits: "Never",
      smokingHabits: "Never",
      fitnessLevel: "Regular",
      hobbies: ["Business", "Reading", "Cricket"],
      interests: ["Business", "Finance", "Technology"],
      languagesKnown: ["Hindi", "English"],
      about: "I am an entrepreneur who loves building businesses. Looking for a life partner who is supportive and understanding.",
      profileImage: "profileImage-1758305645608-133956442.jpeg",
      photos: ["photos-1757266563255-53836263.jpg"],
      agreeToTerms: true,
      isOtpVerified: true,
      preferences: {
        ageRange: { min: 26, max: 32 },
        height: "5'4\" - 5'8\"",
        maritalStatus: "Never Married",
        religion: "Hindu",
        education: "Graduate",
        profession: "Any",
        location: "Delhi",
        diet: "Vegetarian"
      }
    }
  ];

  const createdUsers = await User.insertMany(additionalUsers);
  console.log(`Created ${createdUsers.length} additional users`);
  return createdUsers;
};

const createHoroscopeData = async (users) => {
  console.log("Creating horoscope data...");
  
  const horoscopeData = [
    {
      user: users[0]._id,
      dateOfBirth: new Date("1995-03-15"),
      timeOfBirth: "10:30 AM",
      placeOfBirth: "New Delhi",
      coordinates: { latitude: 28.6139, longitude: 77.2090 },
      sunSign: "Pisces",
      moonSign: "Cancer",
      risingSign: "Leo",
      nakshatra: "Uttara Bhadrapada",
      nakshatraLord: "Saturn",
      nakshatraPada: 2,
      planetaryPositions: {
        sun: "Pisces",
        moon: "Cancer",
        mars: "Aries",
        mercury: "Aquarius",
        jupiter: "Sagittarius",
        venus: "Pisces",
        saturn: "Pisces",
        rahu: "Leo",
        ketu: "Aquarius"
      },
      compatibilityFactors: {
        manglik: false,
        mangalDosha: "None",
        nadi: "Adi",
        gana: "Deva",
        yoni: "Ashwa",
        varna: "Brahmin",
        vashya: "Chatushpada",
        tara: "Rohini",
        yoniCompatibility: 75,
        ganaCompatibility: 80,
        nadiCompatibility: 60
      },
      overallScore: 85,
      isVerified: true,
      isPublic: true
    },
    {
      user: users[1]._id,
      dateOfBirth: new Date("1994-11-10"),
      timeOfBirth: "2:15 PM",
      placeOfBirth: "New Delhi",
      coordinates: { latitude: 28.6139, longitude: 77.2090 },
      sunSign: "Scorpio",
      moonSign: "Pisces",
      risingSign: "Cancer",
      nakshatra: "Anuradha",
      nakshatraLord: "Saturn",
      nakshatraPada: 3,
      planetaryPositions: {
        sun: "Scorpio",
        moon: "Pisces",
        mars: "Leo",
        mercury: "Scorpio",
        jupiter: "Virgo",
        venus: "Libra",
        saturn: "Aquarius",
        rahu: "Gemini",
        ketu: "Sagittarius"
      },
      compatibilityFactors: {
        manglik: false,
        mangalDosha: "None",
        nadi: "Madhya",
        gana: "Rakshasa",
        yoni: "Gaja",
        varna: "Kshatriya",
        vashya: "Manushya",
        tara: "Rohini",
        yoniCompatibility: 70,
        ganaCompatibility: 75,
        nadiCompatibility: 65
      },
      overallScore: 80,
      isVerified: true,
      isPublic: true
    }
  ];

  await Horoscope.insertMany(horoscopeData);
  console.log("Horoscope data created successfully");
};

const createInteractions = async (users) => {
  console.log("Creating interactions...");
  
  const interactions = [
    {
      fromUser: users[3]._id, // Rahul
      toUser: users[0]._id,    // Priya
      type: "like",
      status: "active"
    },
    {
      fromUser: users[0]._id,  // Priya
      toUser: users[3]._id,    // Rahul
      type: "like",
      status: "active"
    },
    {
      fromUser: users[4]._id,  // Vikram
      toUser: users[1]._id,    // Anjali
      type: "superlike",
      status: "active"
    },
    {
      fromUser: users[1]._id,  // Anjali
      toUser: users[4]._id,    // Vikram
      type: "like",
      status: "active"
    },
    {
      fromUser: users[3]._id,  // Rahul
      toUser: users[1]._id,    // Anjali
      type: "visit",
      status: "active"
    },
    {
      fromUser: users[0]._id,  // Priya
      toUser: users[4]._id,   // Vikram
      type: "visit",
      status: "active"
    }
  ];

  await Interaction.insertMany(interactions);
  console.log("Interactions created successfully");
};

const createUserMemberships = async (users) => {
  console.log("Creating user memberships...");
  
  if (!users || users.length < 3) {
    console.log("Not enough users for memberships");
    return;
  }
  
  const memberships = [
    {
      user: users[0]._id,
      plan: "Basic",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      paymentStatus: "completed"
    },
    {
      user: users[1]._id,
      plan: "Premium",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      paymentStatus: "completed"
    },
    {
      user: users[3]._id,
      plan: "Elite",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      paymentStatus: "completed"
    }
  ];

  await UserMembership.insertMany(memberships);
  console.log("User memberships created successfully");
};

const main = async () => {
  try {
    await connectDB();
    
    console.log("Starting test data creation...");
    
    // Create membership plans
    await createMembershipPlans();
    
    // Create initial users
    const users = await createTestUsers();
    
    // Create additional users
    const additionalUsers = await createMoreUsers();
    const allUsers = [...users, ...additionalUsers];
    
    // Create horoscope data for first 2 users
    await createHoroscopeData(users.slice(0, 2));
    
    // Create interactions
    await createInteractions(allUsers);
    
    // Create user memberships
    if (users.length >= 4) {
      await createUserMemberships(users.slice(0, 3));
    }
    
    console.log("Test data creation completed successfully!");
    console.log(`Total users created: ${allUsers.length}`);
    console.log("Users with different profiles, preferences, and subscription levels");
    
  } catch (error) {
    console.error("Error in main process:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed");
  }
};

main();
