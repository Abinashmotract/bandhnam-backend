import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Horoscope from "../models/Horoscope.js";
import SuccessStory from "../models/SuccessStory.js";
import Blog from "../models/Blog.js";
import ProfileAnalytics from "../models/ProfileAnalytics.js";
import Interaction from "../models/Interaction.js";
import MembershipPlan from "../models/MembershipPlan.js";
import UserMembership from "../models/UserMembership.js";
import Notification from "../models/Notification.js";
import Message from "../models/Message.js";
import ChatRoom from "../models/ChatRoom.js";
import SearchFilter from "../models/SearchFilter.js";
import Verification from "../models/Verification.js";
import Contact from "../models/Contact.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const clearAllData = async () => {
  try {
    console.log("Clearing all data...");
    
    await User.deleteMany({});
    await Horoscope.deleteMany({});
    await SuccessStory.deleteMany({});
    await Blog.deleteMany({});
    await ProfileAnalytics.deleteMany({});
    await Interaction.deleteMany({});
    await MembershipPlan.deleteMany({});
    await UserMembership.deleteMany({});
    await Notification.deleteMany({});
    await Message.deleteMany({});
    await ChatRoom.deleteMany({});
    await SearchFilter.deleteMany({});
    await Verification.deleteMany({});
    await Contact.deleteMany({});
    
    console.log("All data cleared successfully");
  } catch (error) {
    console.error("Error clearing data:", error);
    throw error;
  }
};

const createMembershipPlans = async () => {
  try {
    console.log("Creating membership plans...");
    
    const plans = [
      {
        name: "Basic",
        price: 0,
        duration: "monthly",
        features: [
          "View 5 profiles per day",
          "Basic search filters",
          "Send 3 interests per day"
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
          "Profile boost"
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
          "Dedicated relationship manager"
        ],
        description: "For serious matrimonial seekers",
        isPopular: false,
        isActive: true
      }
    ];

    await MembershipPlan.insertMany(plans);
    console.log("Membership plans created successfully");
  } catch (error) {
    console.error("Error creating membership plans:", error);
    throw error;
  }
};

const createTestUsers = async () => {
  try {
    console.log("Creating test users...");
    
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const users = [
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
        petPreferences: "Dogs",
        about: "I am a software engineer who loves technology and enjoys cooking. Looking for a life partner who shares similar values.",
        profileImage: "profileImage-1749710531066-793879098.webp",
        photos: ["photos-1756966843060-914643708.avif", "photos-1756966843061-573768546.jpg"],
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
          diet: "Vegetarian",
          qualities: ["Honest", "Caring", "Ambitious"],
          dealBreakers: ["Smoking", "Drinking"],
          educationPref: "Graduate",
          occupationPref: ["Engineer", "Doctor", "Teacher"],
          annualIncomePref: "3-8",
          lifestyleExpectations: {
            diet: "Vegetarian",
            drinking: "Never",
            smoking: "Never"
          },
          religionCastePref: "Hindu",
          locationPref: "Delhi",
          relocation: "Open",
          familyOrientation: "Traditional",
          maritalStatusPref: "Never Married"
        }
      },
      {
        name: "Rahul Kumar",
        email: "rahul.kumar@example.com",
        phoneNumber: "9876543211",
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
        petPreferences: "Dogs",
        about: "I am a business analyst with a passion for cricket and travel. Looking for a life partner who is understanding and supportive.",
        profileImage: "profileImage-1757270160698-605352629.jpg",
        photos: ["photos-1756967138381-738879547.avif", "photos-1756967138382-335071741.jpg"],
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
          diet: "Vegetarian",
          qualities: ["Caring", "Understanding", "Independent"],
          dealBreakers: ["Smoking"],
          educationPref: "Graduate",
          occupationPref: ["Teacher", "Engineer", "Doctor"],
          annualIncomePref: "2-8",
          lifestyleExpectations: {
            diet: "Vegetarian",
            drinking: "Occasionally",
            smoking: "Never"
          },
          religionCastePref: "Hindu",
          locationPref: "Delhi",
          relocation: "Open",
          familyOrientation: "Traditional",
          maritalStatusPref: "Never Married"
        }
      },
      {
        name: "Anjali Singh",
        email: "anjali.singh@example.com",
        phoneNumber: "9876543212",
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
        petPreferences: "Cats",
        about: "I am a doctor who loves dancing and yoga. Looking for a life partner who is caring and family-oriented.",
        profileImage: "profileImage-1757270508991-206006177.jpg",
        photos: ["photos-1756967138386-585247217.jpeg", "photos-1756967138386-79720954.jpg"],
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
          diet: "Vegetarian",
          qualities: ["Honest", "Caring", "Respectful"],
          dealBreakers: ["Smoking", "Drinking"],
          educationPref: "Graduate",
          occupationPref: ["Engineer", "Doctor", "Business"],
          annualIncomePref: "5-15",
          lifestyleExpectations: {
            diet: "Vegetarian",
            drinking: "Never",
            smoking: "Never"
          },
          religionCastePref: "Hindu",
          locationPref: "Delhi",
          relocation: "Open",
          familyOrientation: "Traditional",
          maritalStatusPref: "Never Married"
        }
      },
      {
        name: "Vikram Patel",
        email: "vikram.patel@example.com",
        phoneNumber: "9876543213",
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
        petPreferences: "Dogs",
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
          diet: "Vegetarian",
          qualities: ["Caring", "Understanding", "Traditional"],
          dealBreakers: ["Smoking", "Drinking"],
          educationPref: "Graduate",
          occupationPref: ["Teacher", "Engineer", "Doctor"],
          annualIncomePref: "3-10",
          lifestyleExpectations: {
            diet: "Vegetarian",
            drinking: "Never",
            smoking: "Never"
          },
          religionCastePref: "Hindu",
          locationPref: "Delhi",
          relocation: "Open",
          familyOrientation: "Traditional",
          maritalStatusPref: "Never Married"
        }
      },
      {
        name: "Sneha Reddy",
        email: "sneha.reddy@example.com",
        phoneNumber: "9876543214",
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
        petPreferences: "Dogs",
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
          diet: "Vegetarian",
          qualities: ["Honest", "Caring", "Ambitious"],
          dealBreakers: ["Smoking", "Drinking"],
          educationPref: "Graduate",
          occupationPref: ["Engineer", "Doctor", "Business"],
          annualIncomePref: "5-15",
          lifestyleExpectations: {
            diet: "Vegetarian",
            drinking: "Never",
            smoking: "Never"
          },
          religionCastePref: "Hindu",
          locationPref: "Delhi",
          relocation: "Open",
          familyOrientation: "Traditional",
          maritalStatusPref: "Never Married"
        }
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log("Test users created successfully");
    return createdUsers;
  } catch (error) {
    console.error("Error creating test users:", error);
    throw error;
  }
};

const createHoroscopeData = async (users) => {
  try {
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
        dateOfBirth: new Date("1992-07-20"),
        timeOfBirth: "2:15 PM",
        placeOfBirth: "New Delhi",
        coordinates: { latitude: 28.6139, longitude: 77.2090 },
        sunSign: "Cancer",
        moonSign: "Scorpio",
        risingSign: "Capricorn",
        nakshatra: "Pushya",
        nakshatraLord: "Saturn",
        nakshatraPada: 3,
        planetaryPositions: {
          sun: "Cancer",
          moon: "Scorpio",
          mars: "Leo",
          mercury: "Cancer",
          jupiter: "Virgo",
          venus: "Gemini",
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
  } catch (error) {
    console.error("Error creating horoscope data:", error);
    throw error;
  }
};

const createSuccessStories = async (users) => {
  try {
    console.log("Creating success stories...");
    
    const successStories = [
      {
        bride: {
          name: "Priya Sharma",
          profileId: users[0]._id,
          age: 28,
          occupation: "Software Engineer",
          location: "Delhi",
          photo: "profileImage-1749710531066-793879098.webp"
        },
        groom: {
          name: "Rahul Kumar",
          profileId: users[1]._id,
          age: 30,
          occupation: "Business Analyst",
          location: "Delhi",
          photo: "profileImage-1757270160698-605352629.jpg"
        },
        title: "From Online Matches to Forever: Priya & Rahul's Love Story",
        story: "Priya and Rahul met through our platform in 2023. Both were looking for someone with similar values and career goals. After exchanging messages for a few weeks, they decided to meet in person. The connection was instant, and they realized they had found their perfect match. They got married in a beautiful ceremony in Delhi and are now happily married with a beautiful family.",
        weddingDate: new Date("2023-12-15"),
        weddingLocation: "Delhi",
        weddingPhotos: ["wedding1.jpg", "wedding2.jpg"],
        howTheyMet: "Search",
        meetingDetails: "They connected through our advanced matching algorithm and started chatting online.",
        testimonial: {
          bride: "This platform helped me find my soulmate. The matching system was so accurate!",
          groom: "I never thought I would find someone so perfect through an online platform. Thank you!"
        },
        photos: ["couple1.jpg", "couple2.jpg"],
        city: "Delhi",
        state: "Delhi",
        country: "India",
        tags: ["Software Engineer", "Business Analyst", "Delhi", "Love Story"],
        status: "approved",
        isVerified: true,
        isFeatured: true,
        views: 1250,
        likes: 89,
        shares: 23
      },
      {
        bride: {
          name: "Anjali Singh",
          profileId: users[2]._id,
          age: 29,
          occupation: "Doctor",
          location: "Delhi",
          photo: "profileImage-1757270508991-206006177.jpg"
        },
        groom: {
          name: "Vikram Patel",
          profileId: users[3]._id,
          age: 32,
          occupation: "Software Engineer",
          location: "Delhi",
          photo: "profileImage-1758305645608-133956442.jpeg"
        },
        title: "A Doctor and Engineer's Perfect Union",
        story: "Anjali and Vikram's story is one of modern love meeting traditional values. Both professionals in their respective fields, they found common ground in their shared values and family-oriented approach to life. Their horoscope compatibility was excellent, and their families were thrilled with the match. They tied the knot in a grand ceremony that celebrated both their cultures.",
        weddingDate: new Date("2024-02-14"),
        weddingLocation: "Delhi",
        weddingPhotos: ["wedding3.jpg", "wedding4.jpg"],
        howTheyMet: "Horoscope Match",
        meetingDetails: "They were matched based on their horoscope compatibility and shared values.",
        testimonial: {
          bride: "The horoscope matching feature was incredibly accurate. We are so grateful!",
          groom: "Finding someone who shares your values and has compatible horoscope is a blessing."
        },
        photos: ["couple3.jpg", "couple4.jpg"],
        city: "Delhi",
        state: "Delhi",
        country: "India",
        tags: ["Doctor", "Engineer", "Horoscope Match", "Delhi"],
        status: "approved",
        isVerified: true,
        isFeatured: true,
        views: 980,
        likes: 67,
        shares: 18
      }
    ];

    await SuccessStory.insertMany(successStories);
    console.log("Success stories created successfully");
  } catch (error) {
    console.error("Error creating success stories:", error);
    throw error;
  }
};

const createBlogPosts = async (users) => {
  try {
    console.log("Creating blog posts...");
    
    const blogPosts = [
      {
        title: "10 Tips for a Successful Matrimonial Profile",
        slug: "10-tips-successful-matrimonial-profile",
        content: "Creating an attractive matrimonial profile is crucial for finding your perfect match. Here are 10 essential tips to make your profile stand out...",
        excerpt: "Learn how to create an attractive matrimonial profile that gets noticed by potential matches.",
        author: users[0]._id,
        category: "Marriage Tips",
        tags: ["Profile", "Tips", "Matrimonial", "Success"],
        featuredImage: "blog1.jpg",
        metaTitle: "10 Tips for Successful Matrimonial Profile",
        metaDescription: "Essential tips to create an attractive matrimonial profile",
        keywords: ["matrimonial", "profile", "tips", "marriage"],
        status: "published",
        isFeatured: true,
        publishedAt: new Date("2024-01-15"),
        readingTime: 5,
        views: 1250,
        likes: 89,
        shares: 23
      },
      {
        title: "Understanding Horoscope Compatibility in Marriage",
        slug: "understanding-horoscope-compatibility-marriage",
        content: "Horoscope compatibility plays a significant role in Indian marriages. Understanding the basics of astrological matching can help you make informed decisions...",
        excerpt: "Learn about horoscope compatibility and its importance in Indian marriages.",
        author: users[1]._id,
        category: "Horoscope & Astrology",
        tags: ["Horoscope", "Compatibility", "Astrology", "Marriage"],
        featuredImage: "blog2.jpg",
        metaTitle: "Horoscope Compatibility in Marriage",
        metaDescription: "Understanding horoscope compatibility for successful marriages",
        keywords: ["horoscope", "compatibility", "astrology", "marriage"],
        status: "published",
        isFeatured: true,
        publishedAt: new Date("2024-01-20"),
        readingTime: 8,
        views: 980,
        likes: 67,
        shares: 18
      },
      {
        title: "Modern vs Traditional: Balancing Values in Marriage",
        slug: "modern-vs-traditional-balancing-values-marriage",
        content: "In today's world, finding the right balance between modern values and traditional beliefs is essential for a successful marriage...",
        excerpt: "Explore how to balance modern and traditional values in your marriage.",
        author: users[2]._id,
        category: "Relationship Advice",
        tags: ["Modern", "Traditional", "Values", "Marriage"],
        featuredImage: "blog3.jpg",
        metaTitle: "Modern vs Traditional Values in Marriage",
        metaDescription: "Balancing modern and traditional values in marriage",
        keywords: ["modern", "traditional", "values", "marriage"],
        status: "published",
        isFeatured: false,
        publishedAt: new Date("2024-01-25"),
        readingTime: 6,
        views: 750,
        likes: 45,
        shares: 12
      }
    ];

    await Blog.insertMany(blogPosts);
    console.log("Blog posts created successfully");
  } catch (error) {
    console.error("Error creating blog posts:", error);
    throw error;
  }
};

const createInteractions = async (users) => {
  try {
    console.log("Creating interactions...");
    
    const interactions = [
      {
        fromUser: users[1]._id,
        toUser: users[0]._id,
        type: "like",
        status: "active"
      },
      {
        fromUser: users[0]._id,
        toUser: users[1]._id,
        type: "like",
        status: "active"
      },
      {
        fromUser: users[3]._id,
        toUser: users[2]._id,
        type: "superlike",
        status: "active"
      },
      {
        fromUser: users[2]._id,
        toUser: users[3]._id,
        type: "like",
        status: "active"
      },
      {
        fromUser: users[1]._id,
        toUser: users[2]._id,
        type: "visit",
        status: "active"
      },
      {
        fromUser: users[0]._id,
        toUser: users[3]._id,
        type: "visit",
        status: "active"
      }
    ];

    await Interaction.insertMany(interactions);
    console.log("Interactions created successfully");
  } catch (error) {
    console.error("Error creating interactions:", error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    
    console.log("Starting data clearing and seeding process...");
    
    // Clear all existing data
    await clearAllData();
    
    // Create membership plans
    await createMembershipPlans();
    
    // Create test users
    const users = await createTestUsers();
    
    // Create horoscope data
    await createHoroscopeData(users);
    
    // Create success stories
    await createSuccessStories(users);
    
    // Create blog posts
    await createBlogPosts(users);
    
    // Create interactions
    await createInteractions(users);
    
    console.log("Data clearing and seeding completed successfully!");
    console.log(`Created ${users.length} test users`);
    console.log("All test data has been inserted successfully");
    
  } catch (error) {
    console.error("Error in main process:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed");
  }
};

main();
