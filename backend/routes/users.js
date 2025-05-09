const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');

// GET /api/users/me
// Get the authenticated user's profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-__v')
      .populate('currentPlan', 'name price type value');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get the latest active purchase for this user
    const latestPurchase = await Purchase.findOne(
      { 
        user: user._id, 
        paymentStatus: 'success',
        $or: [
          // For duration-based plans, check if not expired
          { expiresAt: { $gt: new Date() } },
          // For count-based plans, check if checks remaining
          { checksRemaining: { $gt: 0 } }
        ]
      }
    ).sort({ createdAt: -1 }).populate('plan', 'name type value');
    
    // Calculate subscription status
    const isSubscriptionActive = latestPurchase ? true : false;
    
    // Count total resumes uploaded
    const resumeCount = await Resume.countDocuments({ user: user._id });
    
    res.json({
      user: {
        _id: user._id,
        firebaseUID: user.firebaseUID,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currentPlan: user.currentPlan,
        planExpiresAt: user.planExpiresAt,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        // Derived data
        isSubscriptionActive,
        activePurchase: latestPurchase 
          ? {
              id: latestPurchase._id,
              planName: latestPurchase.plan.name,
              type: latestPurchase.plan.type,
              expiresAt: latestPurchase.expiresAt,
              checksRemaining: latestPurchase.checksRemaining
            } 
          : null,
        resumeCount
      }
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// PUT /api/users/me
// Update the authenticated user's profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Find the user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    
    await user.save();
    
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/users/me/purchases
// Get purchase history for authenticated user
router.get('/me/purchases', auth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.user.userId })
      .populate('plan', 'name price type value')
      .sort({ createdAt: -1 });
    
    res.json({ purchases });
  } catch (err) {
    console.error('Error fetching purchase history:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/users/me/resumes
// Get resumes for authenticated user
router.get('/me/resumes', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.userId })
      .sort({ uploadedAt: -1 });
    
    res.json({ resumes });
  } catch (err) {
    console.error('Error fetching resume history:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/users/me/active-plan
// Get the current active plan for the authenticated user
router.get('/me/active-plan', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find the user and populate the currentPlan reference
    const user = await User.findById(userId).populate('currentPlan');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find the most recent active purchase
    const activePurchase = await Purchase.findOne({
      user: userId,
      $or: [
        // Either a duration plan that's not expired
        { 
          expiresAt: { $gt: new Date() }
        },
        // Or a count plan with remaining checks
        { 
          checksRemaining: { $gt: 0 }
        }
      ]
    }).sort({ activatedAt: -1 }).populate('plan');
    
    if (!activePurchase) {
      return res.json({
        activePlan: null,
        hasActivePlan: false,
        message: 'No active plan found'
      });
    }
    
    // Build the plan details for the frontend
    const planDetails = {
      _id: activePurchase.plan._id,
      name: activePurchase.plan.name,
      type: activePurchase.plan.type,
      value: activePurchase.plan.value,
      // Derived fields for easier UI handling
      hasUnlimitedChecks: activePurchase.plan.type === 'duration',
      remainingChecks: activePurchase.checksRemaining,
      expiresAt: activePurchase.expiresAt
    };
    
    res.json({
      activePlan: planDetails,
      hasActivePlan: true,
      activePurchase: {
        _id: activePurchase._id,
        activatedAt: activePurchase.activatedAt,
        expiresAt: activePurchase.expiresAt,
        checksRemaining: activePurchase.checksRemaining
      }
    });
  } catch (err) {
    console.error('Error fetching active plan:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 