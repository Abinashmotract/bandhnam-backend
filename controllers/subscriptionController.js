import User from "../models/User.js";
import MembershipPlan from "../models/MembershipPlan.js";
import UserMembership from "../models/UserMembership.js";
import Transaction from "../models/Transaction.js";
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { sendInvoiceEmail } from '../utils/sendInvoiceEmail.js';

// Initialize Razorpay lazily to ensure environment variables are loaded
let razorpay = null;

const getRazorpay = () => {
  if (!razorpay) {
    // Support both naming conventions (including common typos)
    const keyId = process.env.RAZORPAY_KEY_ID || 
                  process.env.RAZORPAY_API_KEY || 
                  process.env.RAZERPAY_API_KEY; // Support typo variant
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 
                      process.env.RAZORPAY_API_SECRET_KEY || 
                      process.env.RAZERPAY_API_SECRET_KEY; // Support typo variant
    
    // Debug logging
    console.log('🔍 Checking Razorpay environment variables...');
    console.log('   RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Not set');
    console.log('   RAZORPAY_API_KEY:', process.env.RAZORPAY_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('   RAZERPAY_API_KEY (typo):', process.env.RAZERPAY_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('   RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Not set');
    console.log('   RAZORPAY_API_SECRET_KEY:', process.env.RAZORPAY_API_SECRET_KEY ? '✅ Set' : '❌ Not set');
    console.log('   RAZERPAY_API_SECRET_KEY (typo):', process.env.RAZERPAY_API_SECRET_KEY ? '✅ Set' : '❌ Not set');
    console.log('   Final keyId:', keyId ? '✅ Found' : '❌ Missing');
    console.log('   Final keySecret:', keySecret ? '✅ Found' : '❌ Missing');
    
    if (!keyId || !keySecret) {
      console.error('❌ Razorpay API keys are required but not found in environment variables.');
      console.error('   Please set either:');
      console.error('   - RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET, OR');
      console.error('   - RAZORPAY_API_KEY and RAZORPAY_API_SECRET_KEY');
      console.error('   Make sure to restart the server after updating .env file');
      throw new Error('Razorpay environment variables are required');
    }
    
    console.log('✅ Razorpay initialized successfully');
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }
  return razorpay;
};

// Test endpoint to check Razorpay environment variables (for debugging)
export const testRazorpayConfig = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_API_KEY;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_API_SECRET_KEY;
    
    return res.status(200).json({
      success: true,
      message: "Razorpay configuration check",
      data: {
        RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set',
        RAZORPAY_API_KEY: process.env.RAZORPAY_API_KEY ? 'Set' : 'Not set',
        RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set',
        RAZORPAY_API_SECRET_KEY: process.env.RAZORPAY_API_SECRET_KEY ? 'Set' : 'Not set',
        finalKeyId: keyId ? 'Found' : 'Missing',
        finalKeySecret: keySecret ? 'Found' : 'Missing',
        keyIdLength: keyId ? keyId.length : 0,
        keySecretLength: keySecret ? keySecret.length : 0
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking configuration",
      error: error.message
    });
  }
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

// Create Razorpay Order for payment
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
        message: "Cannot create order for free plan"
      });
    }

    // Create Razorpay order for one-time subscription payment
    // Note: Payment methods (UPI, Cards, Netbanking, Wallets) are controlled by Razorpay account settings
    // To enable international cards, configure in Razorpay Dashboard: Settings > Payment Methods
    const razorpayInstance = getRazorpay();
    
    // Generate a short receipt (Razorpay limit: 40 characters)
    // Format: rec_<userId_last6chars>_<timestamp_last6chars>
    const userIdShort = userId.toString().slice(-6);
    const timestampShort = Date.now().toString().slice(-6);
    const receipt = `rec_${userIdShort}_${timestampShort}`;
    
    const options = {
      amount: plan.price * 100, // Convert to paise
      currency: 'INR',
      receipt: receipt, // Max 40 characters
      // Payment methods are enabled by default based on Razorpay account settings
      // UPI, Cards, Netbanking, and Wallets will be available if enabled in dashboard
      notes: {
        userId: userId.toString(),
        planId: planId.toString(),
        planName: plan.name,
        duration: plan.duration,
        paymentType: 'one_time_subscription' // Mark as one-time subscription payment
      }
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_API_KEY || process.env.RAZERPAY_API_KEY
      }
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating order",
      error: error.message
    });
  }
};

// Confirm payment and create subscription
export const confirmPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, planId } = req.body;
    const userId = req.user.id;

    // Verify payment signature with Razorpay
    const razorpayInstance = getRazorpay();
    const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_API_SECRET_KEY || process.env.RAZERPAY_API_SECRET_KEY;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    // Verify payment with Razorpay
    const payment = await razorpayInstance.payments.fetch(paymentId);
    
    if (payment.status !== 'captured' && payment.status !== 'authorized') {
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
      paymentIntentId: orderId,
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
      orderId,
      paymentId,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      amount: plan.price,
      currency: 'INR',
      status: 'succeeded',
      paymentMethod: payment.method || 'card',
      description: `${plan.name} Plan Subscription (${plan.duration})`
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

// Razorpay webhook handler
export const handleWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured');
      return res.status(400).send('Webhook secret not configured');
    }

    // Verify webhook signature
    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== webhookSignature) {
      console.error('Webhook signature verification failed');
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;

    // Handle the event
    switch (event.event) {
      case 'payment.captured':
        const payment = event.payload.payment.entity;
        console.log('Payment captured:', payment.id);
        
        // Create subscription and transaction
        try {
          const orderId = payment.order_id;
          const order = await getRazorpay().orders.fetch(orderId);
          const { userId, planId } = order.notes;
          
          const plan = await MembershipPlan.findById(planId);
          
          if (plan && payment.status === 'captured') {
            // Check if transaction already exists
            const existingTransaction = await Transaction.findOne({ orderId });
            if (existingTransaction) {
              console.log('Transaction already exists for order:', orderId);
              return res.status(200).json({ received: true });
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

            // Deactivate current subscription if exists
            await UserMembership.updateMany(
              { user: userId, isActive: true },
              { isActive: false }
            );

            // Create subscription
            const userMembership = new UserMembership({
              user: userId,
              plan: planId,
              startDate,
              endDate,
              isActive: true,
              paymentIntentId: orderId,
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
              orderId,
              paymentId: payment.id,
              razorpayOrderId: orderId,
              razorpayPaymentId: payment.id,
              amount: plan.price,
              currency: 'INR',
              status: 'succeeded',
              paymentMethod: payment.method || 'card',
              description: `${plan.name} Plan Subscription (${plan.duration})`
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
          console.error('Error processing payment capture:', error);
        }
        break;
      case 'payment.failed':
        const failedPayment = event.payload.payment.entity;
        console.log('Payment failed:', failedPayment.id);
        break;
      default:
        console.log(`Unhandled event type ${event.event}`);
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
        { orderId: { $regex: search, $options: 'i' } },
        { paymentId: { $regex: search, $options: 'i' } },
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

// Get order details for payment success page
export const getCheckoutSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params; // This is actually orderId in Razorpay
    const userId = req.user.id;

    // Retrieve order from Razorpay
    const razorpayInstance = getRazorpay();
    const order = await razorpayInstance.orders.fetch(sessionId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Get plan details from notes
    const { planId } = order.notes;
    const plan = await MembershipPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    // Get transaction details if available
    const transaction = await Transaction.findOne({ orderId: sessionId })
      .populate('plan', 'name price duration features');

    // Calculate amount - prioritize transaction, then order, then plan price
    let amount = 0;
    if (transaction?.amount) {
      amount = transaction.amount;
    } else if (order.amount) {
      amount = order.amount / 100; // Convert from paise
    } else if (plan?.price) {
      amount = plan.price;
    }

    // Get payment status
    let paymentStatus = 'pending';
    if (transaction) {
      paymentStatus = transaction.status === 'succeeded' ? 'paid' : transaction.status;
    } else if (order.status === 'paid') {
      paymentStatus = 'paid';
    }

    res.status(200).json({
      success: true,
      message: "Order details retrieved successfully",
      data: {
        orderId: order.id,
        amount: amount,
        currency: order.currency,
        paymentStatus: paymentStatus,
        plan: plan,
        transaction: transaction
      }
    });
  } catch (error) {
    console.error("Get order details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving order details",
      error: error.message
    });
  }
};

// Helper function to process completed payment
const processCompletedPayment = async (order, paymentId, userId, planId) => {
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
    paymentIntentId: order.id,
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
    orderId: order.id,
    paymentId: paymentId,
    razorpayOrderId: order.id,
    razorpayPaymentId: paymentId,
    amount: plan.price,
    currency: 'INR',
    status: 'succeeded',
    paymentMethod: 'card',
    description: `${plan.name} Plan Subscription (${plan.duration})`
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

  console.log('Payment processed successfully for order:', order.id);
  return transaction;
};

// Manual payment processing endpoint for testing
export const processPaymentManually = async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;
    const userId = req.user.id;

    // Retrieve order from Razorpay
    const razorpayInstance = getRazorpay();
    const order = await razorpayInstance.orders.fetch(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: "Payment not completed yet"
      });
    }

    // Check if already processed
    const existingTransaction = await Transaction.findOne({ orderId });
    if (existingTransaction) {
      return res.status(200).json({
        success: true,
        message: "Payment already processed",
        data: existingTransaction
      });
    }

    // Process the payment
    const { planId } = order.notes;
    const transaction = await processCompletedPayment(order, paymentId, userId, planId);

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
