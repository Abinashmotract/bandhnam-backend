import mongoose from 'mongoose';
import MembershipPlan from '../models/MembershipPlan.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bandhnam', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const subscriptionPlans = [
  // Basic Plan (Free)
  {
    name: "Basic",
    price: 0,
    duration: "monthly",
    planType: "free",
    profileViews: 5,
    interests: 0,
    shortlists: 0,
    contactViews: 0,
    features: [
      "User Registration",
      "Profile Creation",
      "View 5 Profiles",
      "Basic Profile Information"
    ],
    description: "Perfect for getting started with your matrimonial journey",
    isPopular: false,
    isActive: true
  },

  // Entry Plan - 3 months
  {
    name: "Entry",
    price: 999,
    duration: "quarterly",
    planType: "paid",
    profileViews: 20,
    interests: 5,
    shortlists: 5,
    contactViews: 5,
    features: [
      "User Registration",
      "Profile Creation",
      "View 20 Profiles",
      "Send 5 Interests",
      "Profile Shortlisting (5 profiles)",
      "Profile Visibility Control (5 profiles)",
      "Messaging (5 profiles)",
      "Contact Views (5 profiles)"
    ],
    description: "Great for those starting their matrimonial search",
    isPopular: false,
    isActive: true
  },

  // Advanced Plan - 3 months
  {
    name: "Advanced",
    price: 4500,
    duration: "quarterly",
    planType: "paid",
    profileViews: 50,
    interests: 50,
    shortlists: 50,
    contactViews: 30,
    features: [
      "User Registration",
      "Profile Creation",
      "View 50 Profiles",
      "Send 50 Interests",
      "Profile Shortlisting (50 profiles)",
      "Daily Recommendations",
      "Profile Visibility Control (50 profiles)",
      "Advanced Privacy Controls",
      "Messaging (50 profiles)",
      "Contact Views (30 profiles)",
      "Advanced Search Filters",
      "See Who Viewed Your Profile",
      "Horoscope Match"
    ],
    description: "Advanced features for serious matrimonial seekers",
    isPopular: true,
    isActive: true
  },

  // Advanced Plan - 6 months
  {
    name: "Advanced",
    price: 6500,
    duration: "yearly",
    planType: "paid",
    profileViews: 70,
    interests: 70,
    shortlists: 70,
    contactViews: 50,
    features: [
      "User Registration",
      "Profile Creation",
      "View 70 Profiles",
      "Send 70 Interests",
      "Profile Shortlisting (70 profiles)",
      "Daily Recommendations",
      "Profile Visibility Control (70 profiles)",
      "Advanced Privacy Controls",
      "Messaging (70 profiles)",
      "Contact Views (50 profiles)",
      "Advanced Search Filters",
      "See Who Viewed Your Profile",
      "Access to Compatibility Score Summary",
      "Personality Test Results",
      "Advanced AI-based Match Suggestions",
      "Horoscope Match"
    ],
    description: "Advanced features for serious matrimonial seekers - 6 months",
    isPopular: false,
    isActive: true
  },

  // Premium Plan - 3 months
  {
    name: "Premium",
    price: 7999,
    duration: "quarterly",
    planType: "paid",
    profileViews: -1, // Unlimited
    interests: -1, // Unlimited
    shortlists: -1, // Unlimited
    contactViews: -1, // Unlimited
    features: [
      "User Registration",
      "Profile Creation",
      "Unlimited Profile Views",
      "Unlimited Interests",
      "Unlimited Profile Shortlisting",
      "Daily Recommendations",
      "Profile Visibility Control",
      "Advanced Privacy Controls",
      "Unlimited Messaging",
      "Unlimited Contact Views",
      "Limited Video/Voice Calling Features",
      "Advanced Search Filters",
      "See Who Viewed Your Profile",
      "Access to Compatibility Score Summary",
      "Personality Test Results",
      "Advanced AI-based Match Suggestions",
      "Horoscope Match",
      "Boost Profile Visibility",
      "Priority Customer Support"
    ],
    description: "Premium features for serious matrimonial seekers",
    isPopular: false,
    isActive: true
  },

  // Premium Plan - 6 months
  {
    name: "Premium",
    price: 9999,
    duration: "yearly",
    planType: "paid",
    profileViews: -1, // Unlimited
    interests: -1, // Unlimited
    shortlists: -1, // Unlimited
    contactViews: -1, // Unlimited
    features: [
      "User Registration",
      "Profile Creation",
      "Unlimited Profile Views",
      "Unlimited Interests",
      "Unlimited Profile Shortlisting",
      "Daily Recommendations",
      "Profile Visibility Control",
      "Advanced Privacy Controls",
      "Unlimited Messaging",
      "Unlimited Contact Views",
      "Limited Video/Voice Calling Features",
      "Advanced Search Filters",
      "See Who Viewed Your Profile",
      "Access to Compatibility Score Summary",
      "Personality Test Results",
      "Advanced AI-based Match Suggestions",
      "Horoscope Match",
      "Boost Profile Visibility",
      "Priority Customer Support"
    ],
    description: "Premium features for serious matrimonial seekers - 6 months",
    isPopular: false,
    isActive: true
  },

  // Elite Plan - 3 months
  {
    name: "Elite",
    price: 19999,
    duration: "quarterly",
    planType: "paid",
    profileViews: -1, // Unlimited
    interests: -1, // Unlimited
    shortlists: -1, // Unlimited
    contactViews: -1, // Unlimited
    features: [
      "User Registration",
      "Profile Creation",
      "Unlimited Profile Views",
      "Unlimited Interests",
      "Unlimited Profile Shortlisting",
      "Daily Recommendations",
      "Profile Visibility Control",
      "Advanced Privacy Controls",
      "Unlimited Messaging",
      "Unlimited Contact Views",
      "Limited Video/Voice Calling Features",
      "Advanced Search Filters",
      "See Who Viewed Your Profile",
      "Access to Compatibility Score Summary",
      "Personality Test Results",
      "Advanced AI-based Match Suggestions",
      "Horoscope Match",
      "Boost Profile Visibility",
      "Priority Customer Support",
      "Elite Member Badge",
      "Dedicated Relationship Manager",
      "Exclusive Elite Features"
    ],
    description: "Elite features for the most serious matrimonial seekers",
    isPopular: false,
    isActive: true
  },

  // Elite Plan - 6 months
  {
    name: "Elite",
    price: 29999,
    duration: "yearly",
    planType: "paid",
    profileViews: -1, // Unlimited
    interests: -1, // Unlimited
    shortlists: -1, // Unlimited
    contactViews: -1, // Unlimited
    features: [
      "User Registration",
      "Profile Creation",
      "Unlimited Profile Views",
      "Unlimited Interests",
      "Unlimited Profile Shortlisting",
      "Daily Recommendations",
      "Profile Visibility Control",
      "Advanced Privacy Controls",
      "Unlimited Messaging",
      "Unlimited Contact Views",
      "Limited Video/Voice Calling Features",
      "Advanced Search Filters",
      "See Who Viewed Your Profile",
      "Access to Compatibility Score Summary",
      "Personality Test Results",
      "Advanced AI-based Match Suggestions",
      "Horoscope Match",
      "Boost Profile Visibility",
      "Priority Customer Support",
      "Elite Member Badge",
      "Dedicated Relationship Manager",
      "Exclusive Elite Features"
    ],
    description: "Elite features for the most serious matrimonial seekers - 6 months",
    isPopular: false,
    isActive: true
  },

  // Elite Plan - 12 months
  {
    name: "Elite",
    price: 49999,
    duration: "yearly",
    planType: "paid",
    profileViews: -1, // Unlimited
    interests: -1, // Unlimited
    shortlists: -1, // Unlimited
    contactViews: -1, // Unlimited
    features: [
      "User Registration",
      "Profile Creation",
      "Unlimited Profile Views",
      "Unlimited Interests",
      "Unlimited Profile Shortlisting",
      "Daily Recommendations",
      "Profile Visibility Control",
      "Advanced Privacy Controls",
      "Unlimited Messaging",
      "Unlimited Contact Views",
      "Limited Video/Voice Calling Features",
      "Advanced Search Filters",
      "See Who Viewed Your Profile",
      "Access to Compatibility Score Summary",
      "Personality Test Results",
      "Advanced AI-based Match Suggestions",
      "Horoscope Match",
      "Boost Profile Visibility",
      "Priority Customer Support",
      "Elite Member Badge",
      "Dedicated Relationship Manager",
      "Exclusive Elite Features"
    ],
    description: "Elite features for the most serious matrimonial seekers - 12 months",
    isPopular: true,
    isActive: true
  }
];

const populatePlans = async () => {
  try {
    await connectDB();

    // Clear existing plans
    await MembershipPlan.deleteMany({});
    console.log('Cleared existing subscription plans');

    // Insert new plans
    const createdPlans = await MembershipPlan.insertMany(subscriptionPlans);
    console.log(`Successfully created ${createdPlans.length} subscription plans`);

    // Display created plans
    createdPlans.forEach(plan => {
      console.log(`- ${plan.name} (${plan.duration}): ₹${plan.price} - ${plan.features.length} features`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error populating subscription plans:', error);
    process.exit(1);
  }
};

populatePlans();
