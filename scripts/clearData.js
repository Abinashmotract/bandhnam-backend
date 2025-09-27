import mongoose from "mongoose";
import dotenv from "dotenv";

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
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
      console.log(`Cleared collection: ${collection.name}`);
    }
    
    console.log("All data cleared successfully");
  } catch (error) {
    console.error("Error clearing data:", error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await clearAllData();
    console.log("Data clearing completed successfully!");
  } catch (error) {
    console.error("Error in main process:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed");
  }
};

main();
