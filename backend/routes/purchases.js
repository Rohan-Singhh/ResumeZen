const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const Plan = require('../models/Plan');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// GET /api/purchases
// Get all purchases for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    // Find all purchases for this user, sort by most recent first
    const purchases = await Purchase.find({ user: req.user.userId })
      .populate('plan')
      .sort({ createdAt: -1 });
    
    res.json({ purchases });
  } catch (err) {
    console.error('Error fetching purchases:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// POST /api/purchases
// Create a new purchase and update user subscription
router.post('/', auth, async (req, res) => {
  try {
    const { planId, paymentMethod, paymentDetails } = req.body;
    const userId = req.user.userId;

    // Enhanced logging
    console.log('Purchase request received:', { 
      body: req.body, 
      planId: typeof planId === 'string' ? planId : JSON.stringify(planId),
      userId 
    });

    // Validate required fields
    if (!planId || !paymentMethod) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required purchase details',
        details: { 
          missingPlanId: !planId,
          missingPaymentMethod: !paymentMethod 
        }
      });
    }

    console.log('Creating purchase with data:', { planId, paymentMethod, userId });

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Find the plan - first check if it's a MongoDB ObjectId
    let plan;
    if (mongoose.Types.ObjectId.isValid(planId)) {
      // If it's a valid ObjectId, look it up directly
      plan = await Plan.findById(planId);
    } else {
      // If not a valid ObjectId, try to find by custom ID fields
      plan = await Plan.findOne({ 
        $or: [
          { customId: planId },
          { planId: planId },
          { name: planId }
        ] 
      });
    }

    if (!plan) {
      return res.status(404).json({ 
        success: false,
        error: 'Plan not found',
        details: { 
          providedPlanId: planId,
          isValidObjectId: mongoose.Types.ObjectId.isValid(planId)
        }
      });
    }
    
    if (!plan.active) {
      return res.status(400).json({ 
        success: false,
        error: 'Plan is currently inactive' 
      });
    }

    // Ensure plan has valid type and value
    if (!['count', 'duration'].includes(plan.type)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid plan type',
        details: { providedType: plan.type }  
      });
    }
    if (typeof plan.value !== 'number' || plan.value <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid plan value',
        details: { providedValue: plan.value }  
      });
    }

    // Calculate activation and expiration times
    const activatedAt = new Date();
    let expiresAt = null;
    let checksRemaining = null;

    // Set values based on plan type
    if (plan.type === 'duration') {
      // For duration-based plans, set expiration date
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.value);
    } else if (plan.type === 'count') {
      // For count-based plans, set the number of checks
      checksRemaining = plan.value;
    }

    // Create new purchase with sanitized data
    const purchase = new Purchase({
      user: userId,
      plan: plan._id,
      amount: plan.price,
      currency: plan.currency || 'INR',
      paymentMethod,
      paymentDetails: paymentDetails || {},
      paymentStatus: 'success', // Assume payment is successful for now
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      activatedAt,
      expiresAt,
      checksRemaining
    });

    await purchase.save();
    console.log('Purchase created successfully:', purchase._id);

    // Update user's current plan
    user.currentPlan = plan._id;
    
    // For duration-based plans, update the expiration date
    if (plan.type === 'duration') {
      user.planExpiresAt = expiresAt;
    }
    
    await user.save();
    console.log('User updated successfully with new plan');

    // Create a clean response object with plan details included
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      currentPlan: plan.name, // Include plan name directly
      planType: plan.type,    // Include plan type
      planValue: plan.value,  // Include plan value
      planExpiresAt: user.planExpiresAt,
      // Add derived fields for easier frontend handling
      hasUnlimitedChecks: plan.type === 'duration',
      remainingChecks: plan.type === 'count' ? plan.value : null
    };

    res.status(201).json({ 
      success: true,
      purchase: {
        _id: purchase._id,
        amount: purchase.amount,
        currency: purchase.currency,
        paymentStatus: purchase.paymentStatus,
        activatedAt: purchase.activatedAt,
        expiresAt: purchase.expiresAt,
        checksRemaining: purchase.checksRemaining
      },
      user: userResponse
    });
  } catch (err) {
    console.error('Error creating purchase:', err);
    // Provide more context in the error message
    let errorMessage = err.message;
    let statusCode = 500;
    
    if (err.name === 'CastError' && err.path === '_id') {
      errorMessage = 'Invalid plan ID format'; 
      statusCode = 400;
    } else if (err.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(err.errors).map(e => e.message).join(', ');
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      success: false,
      error: 'Server error during purchase creation', 
      details: errorMessage
    });
  }
});

// GET /api/purchases/:id
// Get a specific purchase
router.get('/:id', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('plan')
      .populate('user', '-__v');
    
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    // Ensure the purchase belongs to the authenticated user
    if (purchase.user._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to access this purchase' });
    }
    
    res.json({ purchase });
  } catch (err) {
    console.error('Error fetching purchase:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// POST /api/purchases/:id/use-check
// Decrement the check count for count-based plans
router.post('/:id/use-check', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    // Ensure the purchase belongs to the authenticated user
    if (purchase.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to access this purchase' });
    }
    
    // Verify this is a count-based plan with remaining checks
    if (!purchase.checksRemaining || purchase.checksRemaining <= 0) {
      return res.status(400).json({ error: 'No checks remaining for this purchase' });
    }
    
    // Decrement the check count
    purchase.checksRemaining -= 1;
    await purchase.save();
    
    res.json({ 
      purchase,
      message: 'Check used successfully',
      checksRemaining: purchase.checksRemaining
    });
  } catch (err) {
    console.error('Error using check:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 