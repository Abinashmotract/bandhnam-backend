import mongoose from 'mongoose';
import MembershipPlan from '../models/MembershipPlan.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bandhnam');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createSubscriptionPlans = async () => {
  try {
    // Clear existing plans
    await MembershipPlan.deleteMany({});
    console.log('Cleared existing subscription plans');

    // Create new subscription plans based on the requirements
    const subscriptionPlans = [
      {
        name: 'Basic',
        price: 0,
        duration: 'monthly',
        planType: 'free',
        features: [
          'View 5 profiles per day',
          'Basic profile information',
          'Create your profile',
          'Basic search filters',
          'Limited messaging'
        ],
        description: 'Perfect for getting started with your matrimonial journey',
        isPopular: false,
        isActive: true,
        profileViews: 5,
        interests: 2,
        shortlists: 1,
        contactViews: 1
      },
      {
        name: 'Entry',
        price: 999,
        duration: 'quarterly',
        planType: 'paid',
        features: [
          'View 20 profiles',
          'Send 5 interests',
          'Profile shortlisting (5 profiles)',
          'Messaging (5 profiles)',
          'Contact views (5 profiles)',
          'Advanced search filters',
          'Priority customer support'
        ],
        description: 'Great for serious matrimonial seekers',
        isPopular: true,
        isActive: true,
        profileViews: 20,
        interests: 5,
        shortlists: 5,
        contactViews: 5
      },
      {
        name: 'Advanced',
        price: 4500,
        duration: 'quarterly',
        planType: 'paid',
        features: [
          'View 50 profiles',
          'Send 50 interests',
          'Daily recommendations',
          'Advanced search filters',
          'Horoscope matching',
          'See who viewed your profile',
          'Priority support',
          'Profile boost'
        ],
        description: 'For those who want comprehensive features',
        isPopular: false,
        isActive: true,
        profileViews: 50,
        interests: 50,
        shortlists: 20,
        contactViews: 20
      },
      {
        name: 'Premium',
        price: 7999,
        duration: 'quarterly',
        planType: 'paid',
        features: [
          'Unlimited profile views',
          'Unlimited interests',
          'Unlimited messaging',
          'Video/voice calling',
          'Priority support',
          'Profile boost',
          'Advanced AI matching',
          'Exclusive events access'
        ],
        description: 'The ultimate matrimonial experience',
        isPopular: false,
        isActive: true,
        profileViews: -1, // Unlimited
        interests: -1, // Unlimited
        shortlists: -1, // Unlimited
        contactViews: -1 // Unlimited
      },
      {
        name: 'Elite',
        price: 19999,
        duration: 'quarterly',
        planType: 'paid',
        features: [
          'All Premium features',
          'Elite member badge',
          'Dedicated relationship manager',
          'Exclusive elite features',
          'Advanced AI matching',
          'Personalized matchmaking',
          'VIP customer support',
          'Exclusive networking events'
        ],
        description: 'The most exclusive matrimonial service',
        isPopular: false,
        isActive: true,
        profileViews: -1, // Unlimited
        interests: -1, // Unlimited
        shortlists: -1, // Unlimited
        contactViews: -1 // Unlimited
      }
    ];

    // Create plans in database
    for (const planData of subscriptionPlans) {
      const plan = new MembershipPlan(planData);
      await plan.save();
      console.log(`Created plan: ${plan.name}`);
    }

    console.log('✅ All subscription plans created successfully!');
    console.log('\n📊 Plan Summary:');
    console.log('1. Basic (Free) - ₹0/month');
    console.log('2. Entry (Paid) - ₹999/quarter - MOST POPULAR');
    console.log('3. Advanced (Paid) - ₹4500/quarter');
    console.log('4. Premium (Paid) - ₹7999/quarter');
    console.log('5. Elite (Paid) - ₹19999/quarter');

  } catch (error) {
    console.error('Error creating subscription plans:', error);
  }
};

const main = async () => {
  await connectDB();
  await createSubscriptionPlans();
  process.exit(0);
};

main();
