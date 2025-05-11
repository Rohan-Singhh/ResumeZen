/**
 * Plan Routes
 * Handles all subscription plan-related API endpoints
 */

const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const UserPlan = require('../models/UserPlan');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   GET /api/plans
 * @desc    Get all available plans
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    
    res.json({
      success: true,
      plans
    });
  } catch (err) {
    console.error('Error fetching plans:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: 'Failed to retrieve plan data'
    });
  }
});

/**
 * @route   GET /api/plans/user
 * @desc    Get current user's subscribed plans
 * @access  Private
 */
router.get('/user', authMiddleware, async (req, res) => {
  try {
    // Get all active user plans
    const userPlans = await UserPlan.find({ 
      userId: req.user.userId,
      isActive: true
    }).populate('planId');
    
    res.json({
      success: true,
      userPlans
    });
  } catch (err) {
    console.error('Error fetching user plans:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: 'Failed to retrieve user plan data'
    });
  }
});

/**
 * @route   POST /api/plans/:planId/purchase
 * @desc    Purchase a plan
 * @access  Private
 */
router.post('/:planId/purchase', authMiddleware, async (req, res) => {
  try {
    // Find the plan
    const plan = await Plan.findById(req.params.planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
        error: 'The requested plan does not exist'
      });
    }
    
    // In a real app, this would include payment processing
    // This is a simplified implementation without actual payment
    
    // Calculate expiration date if applicable
    let expiresAt = null;
    if (plan.durationInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.durationInDays);
    }
    
    // Create new user plan
    const userPlan = new UserPlan({
      userId: req.user.userId,
      planId: plan._id,
      creditsLeft: plan.credits,
      expiresAt,
      isActive: true
    });
    
    await userPlan.save();
    
    res.json({
      success: true,
      message: 'Plan purchased successfully',
      userPlan: await userPlan.populate('planId')
    });
  } catch (err) {
    console.error('Error purchasing plan:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: 'Failed to process plan purchase'
    });
  }
});

/**
 * @route   POST /api/plans/seed
 * @desc    Seed initial plans (admin only)
 * @access  Private/Admin
 */
router.post('/seed', async (req, res) => {
  try {
    // In a production app, this would have proper admin authorization
    // For now, we'll just check if plans already exist
    const plansExist = await Plan.countDocuments();
    
    // Force replace plans if specified in query
    const forceReplace = req.query.force === 'true';
    
    if (plansExist > 0 && !forceReplace) {
      return res.status(400).json({
        success: false,
        message: 'Plans already exist',
        error: 'Database already has plan data. Use ?force=true to replace.'
      });
    }
    
    // Delete existing plans if force replacing
    if (forceReplace) {
      await Plan.deleteMany({});
    }
    
    // Create default plans matching the frontend FALLBACK_PLANS
    const plans = [
      {
        name: 'One-Time Check',
        price: 19,
        credits: 1,
        durationInDays: null,
        isUnlimited: false,
        features: [
          "1 resume ATS check",
          "Personalized improvement tips",
          "Basic AI analysis",
          "24/7 email support",
          "Export to PDF"
        ]
      },
      {
        name: 'Boost Pack',
        price: 70,
        credits: 5,
        durationInDays: null,
        isUnlimited: false,
        isPopular: true,
        features: [
          "5 resume checks",
          "Track improvement history",
          "Advanced AI analysis",
          "Priority email support",
          "Export to multiple formats",
          "LinkedIn profile optimization",
          "Industry-specific keywords"
        ]
      },
      {
        name: 'Unlimited Pack',
        price: 500,
        credits: 999,
        durationInDays: 90, // 3 months
        isUnlimited: true,
        isSpecial: true,
        features: [
          "Unlimited resume checks",
          "Real-time ATS scoring",
          "Premium AI suggestions",
          "24/7 priority support",
          "All export formats",
          "LinkedIn & GitHub optimization",
          "Custom branding options",
          "Interview preparation tips",
          "Job market insights"
        ]
      }
    ];
    
    await Plan.insertMany(plans);
    
    res.json({
      success: true,
      message: 'Plans seeded successfully',
      plans: await Plan.find()
    });
  } catch (err) {
    console.error('Error seeding plans:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: 'Failed to seed plan data'
    });
  }
});

module.exports = router; 