import mongoose from "mongoose";
import dotenv from "dotenv";
import Transaction from "../models/Transaction.js";
import UserMembership from "../models/UserMembership.js";
import User from "../models/User.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const clearStripeData = async () => {
  try {
    console.log("Starting Stripe data cleanup...\n");

    // 1. Find and delete transactions with Stripe payment intent IDs
    // Stripe payment intent IDs start with "pi_"
    const stripeTransactionsQuery = {
      $or: [
        { paymentIntentId: { $regex: /^pi_/ } }, // Stripe payment intent prefix
        { stripeChargeId: { $exists: true } }, // Old Stripe charge ID field
        { orderId: { $regex: /^pi_/ } } // In case orderId was mistakenly set to payment intent
      ]
    };

    // Also find transactions without orderId (likely old Stripe transactions from before migration)
    const transactionsWithoutOrderId = await Transaction.find({ orderId: { $exists: false } });
    const stripeTransactions = await Transaction.find(stripeTransactionsQuery);
    
    // Combine both sets
    const allStripeTransactionIds = [
      ...stripeTransactions.map(t => t._id),
      ...transactionsWithoutOrderId.map(t => t._id)
    ];

    const totalStripeTransactions = allStripeTransactionIds.length;
    console.log(`Found ${totalStripeTransactions} transactions with Stripe data`);
    
    if (totalStripeTransactions > 0) {
      // Get subscription IDs from all stripe transactions
      const allStripeTransactions = await Transaction.find({
        _id: { $in: allStripeTransactionIds }
      });
      const subscriptionIds = allStripeTransactions
        .map(t => t.subscription)
        .filter(id => id);

      // Delete transactions
      const deleteResult = await Transaction.deleteMany({
        _id: { $in: allStripeTransactionIds }
      });
      console.log(`✓ Deleted ${deleteResult.deletedCount} transactions with Stripe data`);

      // Delete associated subscriptions
      if (subscriptionIds.length > 0) {
        const subscriptionDeleteResult = await UserMembership.deleteMany({
          _id: { $in: subscriptionIds }
        });
        console.log(`✓ Deleted ${subscriptionDeleteResult.deletedCount} associated subscriptions`);
      }
    }

    // 2. Find and delete UserMembership records with Stripe payment intent IDs
    const stripeMemberships = await UserMembership.find({
      paymentIntentId: { $regex: /^pi_/ } // Stripe payment intent prefix
    });

    console.log(`\nFound ${stripeMemberships.length} user memberships with Stripe payment intents`);
    
    if (stripeMemberships.length > 0) {
      const membershipIds = stripeMemberships.map(m => m._id);
      const userIds = stripeMemberships.map(m => m.user);

      // Delete memberships
      const deleteResult = await UserMembership.deleteMany({
        _id: { $in: membershipIds }
      });
      console.log(`✓ Deleted ${deleteResult.deletedCount} user memberships with Stripe data`);

      // Clean up user membership references
      if (userIds.length > 0) {
        const userUpdateResult = await User.updateMany(
          { _id: { $in: userIds } },
          { 
            $unset: { 
              membership: "",
              'membership.plan': "",
              'membership.startDate': "",
              'membership.endDate': "",
              'membership.isActive': ""
            }
          }
        );
        console.log(`✓ Cleaned up membership references for ${userUpdateResult.modifiedCount} users`);
      }

      // Also delete any transactions associated with these memberships
      const associatedTransactions = await Transaction.deleteMany({
        subscription: { $in: membershipIds }
      });
      console.log(`✓ Deleted ${associatedTransactions.deletedCount} transactions associated with deleted memberships`);
    }

    // 3. Final cleanup - check for any remaining Stripe-related data
    const remainingStripeTransactions = await Transaction.find({
      $or: [
        { paymentIntentId: { $regex: /^pi_/ } },
        { stripeChargeId: { $exists: true } },
        { orderId: { $exists: false } }
      ]
    });

    if (remainingStripeTransactions.length > 0) {
      console.log(`\n⚠ Warning: Found ${remainingStripeTransactions.length} additional transactions with Stripe data`);
      const finalDelete = await Transaction.deleteMany({
        $or: [
          { paymentIntentId: { $regex: /^pi_/ } },
          { stripeChargeId: { $exists: true } },
          { orderId: { $exists: false } }
        ]
      });
      console.log(`✓ Deleted ${finalDelete.deletedCount} additional Stripe transactions`);
    }

    // 4. Summary
    console.log("\n" + "=".repeat(50));
    console.log("Stripe Data Cleanup Summary:");
    console.log("=".repeat(50));
    console.log("✓ All Stripe-related transactions have been deleted");
    console.log("✓ All Stripe-related subscriptions have been deleted");
    console.log("✓ User membership references have been cleaned up");
    console.log("\n✅ Stripe data cleanup completed successfully!");

  } catch (error) {
    console.error("Error clearing Stripe data:", error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await clearStripeData();
  } catch (error) {
    console.error("Error in main process:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDatabase connection closed");
  }
};

main();

