import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

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

const createOnlineMatches = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create 2-3 profiles with realistic data that will show as online matches
    const onlineProfiles = [
      {
        name: "Prabhasini Swain",
        email: "prabhasini.swain@example.com",
        phoneNumber: "9876543212",
        password: hashedPassword,
        profileFor: "self",
        gender: "female",
        dob: new Date("1993-05-20"),
        age: 30,
        state: "Odisha",
        city: "Bhubaneswar",
        location: "Bhubaneswar, Odisha",
        religion: "Hindu",
        caste: "Karana",
        motherTongue: ["Odia", "Hindi", "English"],
        maritalStatus: "never_married",
        highestQualification: "Master's",
        fieldOfStudy: "Business Administration",
        occupation: "Marketing Manager",
        industry: "Marketing",
        annualIncome: "5-10",
        education: "MBA",
        height: "5'5\"",
        weight: "58",
        bodyType: "Average",
        complexion: "Fair",
        diet: "Vegetarian",
        drinkingHabits: "Never",
        smokingHabits: "Never",
        fitnessLevel: "Regular",
        hobbies: ["Reading", "Travel", "Photography"],
        interests: ["Business", "Travel", "Food"],
        languagesKnown: ["Odia", "Hindi", "English"],
        about: "I am a marketing professional who loves traveling and exploring new places. Looking for a life partner who values family and shares similar interests.",
        agreeToTerms: true,
        isOtpVerified: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        isOnline: true,
        lastSeen: new Date(),
        profileImage: null, // Will use default avatar if not provided
        preferences: {
          ageRange: { min: 28, max: 36 },
          height: "5'6\" - 6'0\"",
          maritalStatus: "Never Married",
          religion: "Hindu",
          education: "Graduate",
          profession: "Business",
          location: "Any",
          diet: "Vegetarian"
        }
      },
      {
        name: "Ananya Patel",
        email: "ananya.patel@example.com",
        phoneNumber: "9876543213",
        password: hashedPassword,
        profileFor: "self",
        gender: "female",
        dob: new Date("1994-08-15"),
        age: 29,
        state: "Gujarat",
        city: "Ahmedabad",
        location: "Ahmedabad, Gujarat",
        religion: "Hindu",
        caste: "Patel",
        motherTongue: ["Gujarati", "Hindi", "English"],
        maritalStatus: "never_married",
        highestQualification: "Master's",
        fieldOfStudy: "Computer Science",
        occupation: "Software Developer",
        industry: "Technology",
        annualIncome: "5-10",
        education: "MSc",
        height: "5'3\"",
        weight: "50",
        bodyType: "Slim",
        complexion: "Wheatish",
        diet: "Vegetarian",
        drinkingHabits: "Never",
        smokingHabits: "Never",
        fitnessLevel: "Active",
        hobbies: ["Coding", "Music", "Dancing"],
        interests: ["Technology", "Music", "Movies"],
        languagesKnown: ["Gujarati", "Hindi", "English"],
        about: "I am a software developer passionate about technology and music. I enjoy coding and dancing in my free time. Looking for someone who understands my work and shares similar values.",
        agreeToTerms: true,
        isOtpVerified: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        isOnline: true,
        lastSeen: new Date(),
        profileImage: null,
        preferences: {
          ageRange: { min: 27, max: 34 },
          height: "5'7\" - 6'1\"",
          maritalStatus: "Never Married",
          religion: "Hindu",
          education: "Graduate",
          profession: "Engineer",
          location: "Gujarat",
          diet: "Vegetarian"
        }
      },
      {
        name: "Kavya Reddy",
        email: "kavya.reddy@example.com",
        phoneNumber: "9876543214",
        password: hashedPassword,
        profileFor: "self",
        gender: "female",
        dob: new Date("1992-11-30"),
        age: 31,
        state: "Telangana",
        city: "Hyderabad",
        location: "Hyderabad, Telangana",
        religion: "Hindu",
        caste: "Reddy",
        motherTongue: ["Telugu", "Hindi", "English"],
        maritalStatus: "never_married",
        highestQualification: "Master's",
        fieldOfStudy: "Finance",
        occupation: "Financial Analyst",
        industry: "Finance",
        annualIncome: "10-20",
        education: "MBA Finance",
        height: "5'6\"",
        weight: "55",
        bodyType: "Average",
        complexion: "Fair",
        diet: "Non-Vegetarian",
        drinkingHabits: "Occasionally",
        smokingHabits: "Never",
        fitnessLevel: "Regular",
        hobbies: ["Reading", "Yoga", "Cooking"],
        interests: ["Finance", "Fitness", "Food"],
        languagesKnown: ["Telugu", "Hindi", "English"],
        about: "I am a financial analyst who believes in work-life balance. I enjoy reading, practicing yoga, and cooking. Looking for a partner who is ambitious yet family-oriented.",
        agreeToTerms: true,
        isOtpVerified: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        isOnline: true,
        lastSeen: new Date(),
        profileImage: null,
        preferences: {
          ageRange: { min: 29, max: 37 },
          height: "5'8\" - 6'2\"",
          maritalStatus: "Never Married",
          religion: "Hindu",
          education: "Graduate",
          profession: "Any",
          location: "Hyderabad",
          diet: "Any"
        }
      }
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const profileData of onlineProfiles) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [
            { email: profileData.email },
            { phoneNumber: profileData.phoneNumber }
          ]
        });

        if (existingUser) {
          console.log(`\n⚠️  User ${profileData.name} already exists. Updating to online status...`);
          existingUser.isOnline = true;
          existingUser.isActive = true;
          existingUser.lastSeen = new Date();
          await existingUser.save();
          skippedCount++;
          continue;
        }

        // Create user
        const user = await User.create(profileData);
        createdCount++;
        console.log(`✅ Created online profile: ${user.name} (${user.email})`);
        console.log(`   - Gender: ${user.gender}`);
        console.log(`   - Age: ${user.age}`);
        console.log(`   - Location: ${user.location}`);
        console.log(`   - Occupation: ${user.occupation}`);
        console.log(`   - isOnline: ${user.isOnline}`);
      } catch (error) {
        console.error(`❌ Error creating profile ${profileData.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Online matches setup completed!`);
    console.log(`   - Created: ${createdCount} new profiles`);
    console.log(`   - Updated: ${skippedCount} existing profiles`);
    
    // Display summary
    const totalOnline = await User.countDocuments({ isOnline: true, isActive: true, role: "user" });
    console.log(`\n📊 Total online users in database: ${totalOnline}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

// Run the seeding function
createOnlineMatches();

