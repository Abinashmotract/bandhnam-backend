import mongoose from "mongoose";
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

// Profile images to update
const profileImageUpdates = [
  {
    userId: "68d8385868c4ba9ede975941",
    profileImageUrl: "https://imgs.search.brave.com/g4dLcOCvvKbKMmqnuJ1au8GRGfARNC5KepKZ9jmUc44/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cudGVsdWd1b25lLmNvbS9waG90b3MvdXBsb2Fkc0V4dC91cGxvYWRzL0thdnlhJTIwS2FseWFucmFtL0thdnlhJTIwS2FseWFuUmFtJTIwTmV3JTIwR2FsbGVyeS9LYXZ5YSUyMEthbHlhblJh bSUyMEdhbGxlcnkud2VicA"
  },
  {
    userId: "68d8385868c4ba9ede975942",
    profileImageUrl: "https://imgs.search.brave.com/F599isaQp8REE-T6yabqck42qIFYv2n4TL9WkiB3HM4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cuZGl0dW5pdmVyc2l0eS5lZHUuaW4vdXBsb2Fkcy9mYWN1bHR5X2ltYWdlcy8xNjg3ODU3MTA4XzEyYzBjZWYyMWE4YzM5N2NiODMzLndlYnA"
  },
  {
    userId: "68d8385868c4ba9ede975935",
    profileImageUrl: "https://imgs.search.brave.com/FW7DkG27fkN2oDlgfKHD8UzOwhuYnBXDn0RFUIWs16I/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0aWMudG9paW1nLmNvbS90aHVtYi9pbWdz/aXplLTIzNDU2LG1zaWQtODgxNDAxMDAsd2lkdGgtNjAwLHJl/c2l6ZW1vZGUtNC84ODE0MDEwMC5qcGc"
  }
];

// Function to update profile images
const updateProfileImages = async () => {
  try {
    await connectDB();
    
    console.log("Starting to update profile images...");
    
    let updatedCount = 0;
    
    for (const update of profileImageUpdates) {
      try {
        // Find user by ID
        const user = await User.findById(update.userId);
        
        if (!user) {
          console.log(`❌ User with ID ${update.userId} not found, skipping...`);
          continue;
        }
        
        // Update profile image
        user.profileImage = update.profileImageUrl;
        await user.save();
        
        updatedCount++;
        console.log(`✅ Updated profile image for: ${user.name} (${user.email})`);
        console.log(`   New image URL: ${update.profileImageUrl}`);
      } catch (error) {
        console.error(`❌ Error updating profile ${update.userId}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Profile image updates completed! Updated ${updatedCount} profiles.`);
    
    // Display summary
    const totalUsers = await User.countDocuments({ role: "user" });
    console.log(`📊 Total users in database: ${totalUsers}`);
    
    // Show updated profiles
    console.log("\n📋 Updated profiles:");
    for (const update of profileImageUpdates) {
      const user = await User.findById(update.userId);
      if (user) {
        console.log(`   - ${user.name}: ${user.profileImage ? '✅ Has image' : '❌ No image'}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Update error:", error);
    process.exit(1);
  }
};

// Run the update function
updateProfileImages();
