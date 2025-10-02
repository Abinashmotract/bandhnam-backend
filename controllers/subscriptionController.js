import User from "../models/User.js";
import MembershipPlan from "../models/MembershipPlan.js";
import UserMembership from "../models/UserMembership.js";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51SCHBXKg4JvCYZiYHDfFOKGn9SIiEUlmHkXskrqVEQgLQcfUQyT6AW8TnLDCi2OoSEyG0n06WkJ3sRyhunCB7Tuu003ov7Xh70');

// Get subscription status
export const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userMembership = await UserMembership.findOne({ user: userId, isActive: true })
      .populate('plan', 'name price duration planType features profileViews interests shortlists contactViews');
    
    if (!userMembership) {
      return res.status(200).json({
        success: true,
        message: "No active subscription found",
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscription status retrieved successfully",
      data: userMembership
    });
  } catch (error) {
    console.error("Get subscription status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching subscription status",
      error: error.message
    });
  }
};

// Create payment intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found"
      });
    }

    if (plan.planType === 'free') {
      return res.status(400).json({
        success: false,
        message: "Cannot create payment intent for free plan"
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.price * 100, // Convert to paise
      currency: 'inr',
      metadata: {
        userId: userId.toString(),
        planId: planId.toString()
      }
    });

    res.status(200).json({
      success: true,
      message: "Payment intent created successfully",
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating payment intent",
      error: error.message
    });
  }
};

// Confirm payment and create subscription
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, planId } = req.body;
    const userId = req.user.id;

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: "Payment not completed"
      });
    }

    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found"
      });
    }

    // Deactivate current subscription if exists
    await UserMembership.updateMany(
      { user: userId, isActive: true },
      { isActive: false }
    );

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    
    if (plan.duration === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.duration === 'quarterly') {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (plan.duration === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Create new subscription
    const userMembership = new UserMembership({
      user: userId,
      plan: planId,
      startDate,
      endDate,
      isActive: true,
      paymentIntentId,
      profileViewsUsed: 0,
      interestsUsed: 0,
      shortlistsUsed: 0,
      contactViewsUsed: 0
    });

    await userMembership.save();

    // Update user's membership reference
    await User.findByIdAndUpdate(userId, {
      membership: {
        plan: planId,
        startDate,
        endDate,
        isActive: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Subscription created successfully",
      data: userMembership
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while confirming payment",
      error: error.message
    });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const userMembership = await UserMembership.findOne({ user: userId, isActive: true });
    
    if (!userMembership) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found"
      });
    }

    // Deactivate subscription
    userMembership.isActive = false;
    userMembership.cancelledAt = new Date();
    await userMembership.save();

    // Update user's membership status
    await User.findByIdAndUpdate(userId, {
      'membership.isActive': false
    });

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully"
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while cancelling subscription",
      error: error.message
    });
  }
};

// Get subscription history
export const getSubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const subscriptions = await UserMembership.find({ user: userId })
      .populate('plan', 'name price duration planType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UserMembership.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      message: "Subscription history retrieved successfully",
      data: {
        subscriptions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalSubscriptions: total,
          hasNext: skip + subscriptions.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error("Get subscription history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching subscription history",
      error: error.message
    });
  }
};

// Update usage statistics
export const updateUsage = async (req, res) => {
  try {
    const { type, increment = 1 } = req.body;
    const userId = req.user.id;

    const userMembership = await UserMembership.findOne({ user: userId, isActive: true });
    
    if (!userMembership) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found"
      });
    }

    const updateField = `${type}Used`;
    if (userMembership[updateField] !== undefined) {
      userMembership[updateField] += increment;
      await userMembership.save();
    }

    res.status(200).json({
      success: true,
      message: "Usage updated successfully",
      data: userMembership
    });
  } catch (error) {
    console.error("Update usage error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating usage",
      error: error.message
    });
  }
};

// Stripe webhook handler
export const handleWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        break;
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('PaymentIntent failed:', failedPayment.id);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
      error: error.message
    });
  }
};

// Get all subscription plans (public endpoint)
export const getSubscriptionPlans = async (req, res) => {
  try {
    const { duration } = req.query;
    
    let query = { isActive: true };
    if (duration) {
      query.duration = duration;
    }
    
    const plans = await MembershipPlan.find(query)
      .select('name price duration planType features profileViews interests shortlists contactViews description')
      .sort({ price: 1 });
    
    res.status(200).json({
      success: true,
      message: "Subscription plans retrieved successfully",
      data: plans
    });
  } catch (error) {
    console.error("Get subscription plans error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching subscription plans",
      error: error.message
    });
  }
};
