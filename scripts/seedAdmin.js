import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import AdminCredential from "../models/AdminCredential.js";

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required to seed admin credentials");
  }

  await connectDB();

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await AdminCredential.findOneAndUpdate(
    { email },
    {
      email,
      password: hashedPassword,
      isActive: true,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  console.log(`Admin credentials seeded for ${admin.email}`);
};

seedAdmin()
  .catch((error) => {
    console.error("Failed to seed admin credentials:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
