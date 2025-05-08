const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Payment = require('../models/Payment');
const Plan = require('../models/Plan');
const auth = require('../middleware/auth');

// GET /api/payments
// Get all payments for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find all payments for this user, sort by most recent first
    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 });
    
    res.json({ payments });
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// POST /api/payments
// Create a new payment and update user subscription
router.post('/', auth, async (req, res) => {
  try {
    const { planId, paymentMethod, paymentDetails } = req.body;
    const userId = req.user.userId;

    if (!planId || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required payment details' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the plan
    const plan = await Plan.findOne({ planId, active: true });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found or inactive' });
    }

    // Calculate valid until date based on plan duration
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (plan.durationDays || 30));

    // Create new payment
    const payment = new Payment({
      userId,
      planId: plan.planId,
      planName: plan.title,
      amount: plan.price,
      currency: plan.currency,
      paymentMethod,
      paymentDetails,
      validUntil,
      status: 'completed', // Assume payment is successful for now
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    });

    await payment.save();

    // Update user's subscription information
    user.currentPlan = plan.type;
    user.currentPlanId = plan.planId;
    user.planStartDate = new Date();
    user.planEndDate = validUntil;
    
    // Set plan benefits
    if (plan.unlimitedChecks) {
      user.hasUnlimitedChecks = true;
    } else {
      user.hasUnlimitedChecks = false;
      user.remainingChecks = plan.checksAllowed || 1;
    }

    // Add payment to user's payment history
    user.paymentHistory.push(payment._id);
    await user.save();

    res.status(201).json({ 
      payment,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currentPlan: user.currentPlan,
        currentPlanId: user.currentPlanId,
        planStartDate: user.planStartDate,
        planEndDate: user.planEndDate,
        remainingChecks: user.remainingChecks,
        hasUnlimitedChecks: user.hasUnlimitedChecks,
        isSubscriptionActive: user.planEndDate ? user.planEndDate > new Date() : false
      }
    });
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/payments/:id
// Get a specific payment
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Ensure the payment belongs to the authenticated user
    if (payment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to access this payment' });
    }
    
    res.json({ payment });
  } catch (err) {
    console.error('Error fetching payment:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 