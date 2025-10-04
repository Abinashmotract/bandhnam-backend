import User from "../models/User.js";
import MembershipPlan from "../models/MembershipPlan.js";
import UserMembership from "../models/UserMembership.js";
import Transaction from "../models/Transaction.js";
import Stripe from 'stripe';
import { sendInvoiceEmail } from '../utils/sendInvoiceEmail.js';

// Initialize Stripe lazily to ensure environment variables are loaded
let stripe = null;

const getStripe = () => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is required but not found in environment variables.');
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

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

// Create Stripe Checkout Session for hosted payment page
export const createCheckoutSession = async (req, res) => {
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
        message: "Cannot create checkout session for free plan"
      });
    }

    // Create checkout session
    const stripeInstance = getStripe();
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${plan.name} Plan`,
              description: plan.description || `Access to ${plan.name} features for ${plan.duration}`,
            },
            unit_amount: plan.price * 100, // Convert to paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/membership?cancelled=true`,
      metadata: {
        userId: userId.toString(),
        planId: planId.toString()
      },
      customer_email: req.user.email,
    });

    res.status(200).json({
      success: true,
      message: "Checkout session created successfully",
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error("Create checkout session error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating checkout session",
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
    const stripeInstance = getStripe();
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);
    
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

    // Create transaction record
    const transaction = new Transaction({
      user: userId,
      plan: planId,
      subscription: userMembership._id,
      paymentIntentId,
      stripeChargeId: paymentIntent.charges.data[0]?.id || paymentIntent.id,
      amount: plan.price,
      currency: 'INR',
      status: 'succeeded',
      paymentMethod: 'card',
      description: `${plan.name} Plan Subscription (${plan.duration})`,
      receiptUrl: paymentIntent.charges.data[0]?.receipt_url
    });

    await transaction.save();

    // Update user's membership reference
    await User.findByIdAndUpdate(userId, {
      membership: {
        plan: planId,
        startDate,
        endDate,
        isActive: true
      }
    });

    // Send invoice email
    try {
      const user = await User.findById(userId).select('email firstName lastName');
      const emailResult = await sendInvoiceEmail(transaction, user, plan);
      
      if (emailResult.success) {
        // Update transaction with email sent status
        await Transaction.findByIdAndUpdate(transaction._id, {
          invoiceSent: true,
          invoiceSentAt: new Date()
        });
        console.log('Invoice email sent successfully');
      } else {
        console.log('Failed to send invoice email:', emailResult.message);
      }
    } catch (emailError) {
      console.error('Error sending invoice email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: "Subscription created successfully",
      data: {
        subscription: userMembership,
        transaction: transaction
      }
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
      const stripeInstance = getStripe();
      event = stripeInstance.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        
        // Create subscription and transaction
        try {
          const { userId, planId } = session.metadata;
          const plan = await MembershipPlan.findById(planId);
          
          if (plan) {
            // Calculate subscription dates
            const startDate = new Date();
            let endDate = new Date();
            
            if (plan.duration === 'monthly') {
              endDate.setMonth(endDate.getMonth() + 1);
            } else if (plan.duration === 'quarterly') {
              endDate.setMonth(endDate.getMonth() + 3);
            } else if (plan.duration === 'yearly') {
              endDate.setFullYear(endDate.getFullYear() + 1);
            }

            // Create subscription
            const userMembership = new UserMembership({
              user: userId,
              plan: planId,
              startDate,
              endDate,
              isActive: true,
              paymentIntentId: session.payment_intent,
              profileViewsUsed: 0,
              interestsUsed: 0,
              shortlistsUsed: 0,
              contactViewsUsed: 0
            });

            await userMembership.save();

            // Create transaction record
            const transaction = new Transaction({
              user: userId,
              plan: planId,
              subscription: userMembership._id,
              paymentIntentId: session.payment_intent,
              stripeChargeId: session.payment_intent,
              amount: plan.price,
              currency: 'INR',
              status: 'succeeded',
              paymentMethod: 'card',
              description: `${plan.name} Plan Subscription (${plan.duration})`,
              receiptUrl: session.receipt_url
            });

            await transaction.save();

            // Update user's membership reference
            await User.findByIdAndUpdate(userId, {
              membership: {
                plan: planId,
                startDate,
                endDate,
                isActive: true
              }
            });

            // Send invoice email
            try {
              const user = await User.findById(userId).select('email firstName lastName');
              if (user) {
                const emailResult = await sendInvoiceEmail(transaction, user, plan);
                
                if (emailResult.success) {
                  await Transaction.findByIdAndUpdate(transaction._id, {
                    invoiceSent: true,
                    invoiceSentAt: new Date()
                  });
                  console.log('Invoice email sent successfully to:', user.email);
                } else {
                  console.log('Email sending failed:', emailResult.message);
                }
              } else {
                console.log('User not found for email sending');
              }
            } catch (emailError) {
              console.error('Error sending invoice email:', emailError);
            }

            console.log('Subscription created successfully via webhook');
          }
        } catch (error) {
          console.error('Error processing checkout session completion:', error);
        }
        break;
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

// Get all transactions (admin endpoint)
export const getAllTransactions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      startDate, 
      endDate,
      search 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    if (search) {
      query.$or = [
        { paymentIntentId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('plan', 'name price duration')
      .populate('subscription', 'startDate endDate isActive')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    // Calculate summary statistics
    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyRevenue = await Transaction.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      message: "Transactions retrieved successfully",
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalTransactions: total,
          hasNext: skip + transactions.length < total,
          hasPrev: parseInt(page) > 1
        },
        summary: {
          totalRevenue: totalRevenue[0]?.total || 0,
          monthlyRevenue: monthlyRevenue[0]?.total || 0,
          totalTransactions: total
        }
      }
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching transactions",
      error: error.message
    });
  }
};

// Get transaction by ID (admin endpoint)
export const getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
      .populate('user', 'firstName lastName email phone')
      .populate('plan', 'name price duration features')
      .populate('subscription', 'startDate endDate isActive');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction retrieved successfully",
      data: transaction
    });
  } catch (error) {
    console.error("Get transaction by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching transaction",
      error: error.message
    });
  }
};

// Get checkout session details for payment success page
export const getCheckoutSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Retrieve session from Stripe
    const stripeInstance = getStripe();
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Checkout session not found"
      });
    }

    // Get plan details from metadata
    const { planId } = session.metadata;
    const plan = await MembershipPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    // Get transaction details if available
    const transaction = await Transaction.findOne({ paymentIntentId: session.payment_intent })
      .populate('plan', 'name price duration features');

    // If payment is completed but no transaction exists, create one
    if (session.payment_status === 'paid' && !transaction) {
      try {
        await processCompletedPayment(session, userId, planId);
        // Refetch transaction after creating it
        const newTransaction = await Transaction.findOne({ paymentIntentId: session.payment_intent })
          .populate('plan', 'name price duration features');
        
        res.status(200).json({
          success: true,
          message: "Checkout session details retrieved successfully",
          data: {
            sessionId: session.id,
            amount: session.amount_total / 100, // Convert from cents
            currency: session.currency,
            paymentStatus: session.payment_status,
            plan: plan,
            transaction: newTransaction,
            customerEmail: session.customer_email,
            receiptUrl: session.receipt_url
          }
        });
        return;
      } catch (processError) {
        console.error("Error processing completed payment:", processError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Checkout session details retrieved successfully",
      data: {
        sessionId: session.id,
        amount: session.amount_total / 100, // Convert from cents
        currency: session.currency,
        paymentStatus: session.payment_status,
        plan: plan,
        transaction: transaction,
        customerEmail: session.customer_email,
        receiptUrl: session.receipt_url
      }
    });
  } catch (error) {
    console.error("Get checkout session details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving checkout session details",
      error: error.message
    });
  }
};

// Helper function to process completed payment
const processCompletedPayment = async (session, userId, planId) => {
  const plan = await MembershipPlan.findById(planId);
  
  if (!plan) {
    throw new Error("Plan not found");
  }

  // Calculate subscription dates
  const startDate = new Date();
  let endDate = new Date();
  
  if (plan.duration === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (plan.duration === 'quarterly') {
    endDate.setMonth(endDate.getMonth() + 3);
  } else if (plan.duration === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  // Create subscription
  const userMembership = new UserMembership({
    user: userId,
    plan: planId,
    startDate,
    endDate,
    isActive: true,
    paymentIntentId: session.payment_intent,
    profileViewsUsed: 0,
    interestsUsed: 0,
    shortlistsUsed: 0,
    contactViewsUsed: 0
  });

  await userMembership.save();

  // Create transaction record
  const transaction = new Transaction({
    user: userId,
    plan: planId,
    subscription: userMembership._id,
    paymentIntentId: session.payment_intent,
    stripeChargeId: session.payment_intent,
    amount: plan.price,
    currency: 'INR',
    status: 'succeeded',
    paymentMethod: 'card',
    description: `${plan.name} Plan Subscription (${plan.duration})`,
    receiptUrl: session.receipt_url
  });

  await transaction.save();

  // Update user's membership reference
  await User.findByIdAndUpdate(userId, {
    membership: {
      plan: planId,
      startDate,
      endDate,
      isActive: true
    }
  });

  // Send invoice email
  try {
    const user = await User.findById(userId).select('email firstName lastName');
    if (user) {
      const emailResult = await sendInvoiceEmail(transaction, user, plan);
      
      if (emailResult.success) {
        await Transaction.findByIdAndUpdate(transaction._id, {
          invoiceSent: true,
          invoiceSentAt: new Date()
        });
        console.log('Invoice email sent successfully to:', user.email);
      } else {
        console.log('Email sending failed:', emailResult.message);
      }
    } else {
      console.log('User not found for email sending');
    }
  } catch (emailError) {
    console.error('Error sending invoice email:', emailError);
  }

  console.log('Payment processed successfully for session:', session.id);
  return transaction;
};

// Manual payment processing endpoint for testing
export const processPaymentManually = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    // Retrieve session from Stripe
    const stripeInstance = getStripe();
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Checkout session not found"
      });
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: "Payment not completed yet"
      });
    }

    // Check if already processed
    const existingTransaction = await Transaction.findOne({ paymentIntentId: session.payment_intent });
    if (existingTransaction) {
      return res.status(200).json({
        success: true,
        message: "Payment already processed",
        data: existingTransaction
      });
    }

    // Process the payment
    const { planId } = session.metadata;
    const transaction = await processCompletedPayment(session, userId, planId);

    res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      data: transaction
    });
  } catch (error) {
    console.error("Manual payment processing error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing payment",
      error: error.message
    });
  }
};
