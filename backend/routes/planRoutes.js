/**
 * Plan Routes
 * Handles all subscription plan-related API endpoints
 */

const crypto = require('crypto');
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
    // Find the plan by code instead of _id
    const plan = await Plan.findOne({ code: req.params.planId });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
        error: 'The requested plan does not exist'
      });
    }
    
    // For subscription plans (unlimited packs), check if user already has an active subscription
    if (plan.isUnlimited && plan.durationInDays >= 30) {
      // Check for existing active unlimited subscriptions
      const now = new Date();
      const existingSubscription = await UserPlan.findOne({
        userId: req.user.userId,
        isActive: true,
        expiresAt: { $gt: now },
        'planId': { $ne: null } // Ensure planId exists
      }).populate('planId');
      
      // If there's an existing unlimited subscription that hasn't expired
      if (existingSubscription && 
          existingSubscription.planId && 
          existingSubscription.planId.isUnlimited) {
        
        const expiryDate = new Date(existingSubscription.expiresAt).toISOString().split('T')[0];
        
        return res.status(400).json({
          success: false,
          message: 'Active subscription exists',
          error: `You already have an active subscription (${existingSubscription.planId.name}) that expires on ${expiryDate}. You cannot purchase a new subscription until the current one expires.`,
          existingPlan: {
            name: existingSubscription.planId.name,
            expiresAt: existingSubscription.expiresAt
          }
        });
      }
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
 * @access  Private/Admin — requires the x-admin-secret header
 *
 * This route can wipe and replace the entire plan catalog (?force=true), so it
 * must never be reachable by anonymous traffic. Callers must send the shared
 * secret configured as ADMIN_SEED_SECRET in the x-admin-secret header.
 */
router.post('/seed', async (req, res) => {
  const adminSecret = process.env.ADMIN_SEED_SECRET;
  if (!adminSecret) {
    // Fail closed: without a configured secret, seeding is disabled entirely.
    return res.status(503).json({
      success: false,
      message: 'Seeding disabled',
      error: 'ADMIN_SEED_SECRET is not configured on the server'
    });
  }

  const provided = Buffer.from(req.header('x-admin-secret') || '');
  const expected = Buffer.from(adminSecret);
  const secretOk =
    provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
  if (!secretOk) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      error: 'Invalid or missing x-admin-secret header'
    });
  }

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
        code: 'one-time-check',
        name: 'One-Time Check',
        price: 19,
        currency: 'INR',
        period: 'one-time',
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
        code: 'boost-pack',
        name: 'Boost Pack',
        price: 70,
        currency: 'INR',
        period: 'one-time',
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
        code: 'unlimited-pack',
        name: 'Unlimited Pack',
        price: 500,
        currency: 'INR',
        period: '3 months',
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

/**
 * @route   POST /api/plans/use-credit
 * @desc    Use a credit from user's active plan
 * @access  Private
 */
router.post('/use-credit', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body;
    console.log('[use-credit] Incoming planId:', planId, 'userId:', req.user.userId);
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required',
        error: 'Missing plan ID in request'
      });
    }
    // Find the user plan (read-only lookup, used to distinguish unlimited plans)
    const existing = await UserPlan.findOne({
      _id: planId,
      userId: req.user.userId,
      isActive: true
    }).populate('planId');
    console.log('[use-credit] Found userPlan:', existing ? existing._id : null, 'creditsLeft:', existing ? existing.creditsLeft : null);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found or not active',
        error: 'The requested user plan does not exist or is not active'
      });
    }
    // If plan is unlimited, no need to decrement credits
    if (existing.planId.isUnlimited) {
      console.log('[use-credit] Plan is unlimited, no deduction.');
      return res.json({
        success: true,
        message: 'Credit not decremented for unlimited plan',
        userPlan: existing
      });
    }
    // Atomic conditional decrement: creditsLeft must still be > 0 at write
    // time. The previous find -> modify -> save pattern allowed two concurrent
    // requests to both spend the same last credit.
    const userPlan = await UserPlan.findOneAndUpdate(
      {
        _id: planId,
        userId: req.user.userId,
        isActive: true,
        creditsLeft: { $gt: 0 }
      },
      { $inc: { creditsLeft: -1 } },
      { new: true }
    ).populate('planId');

    if (!userPlan) {
      console.log('[use-credit] No credits left to deduct.');
      return res.status(400).json({
        success: false,
        message: 'No credits remaining',
        error: 'This plan has no credits left'
      });
    }
    console.log('[use-credit] Deducted credit. creditsLeft:', userPlan.creditsLeft);
    res.json({
      success: true,
      message: 'Credit used successfully',
      userPlan
    });
  } catch (err) {
    console.error('Error using credit:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: 'Failed to process credit usage'
    });
  }
});

/**
 * @route   POST /api/plans/refund-credit
 * @desc    Refund a credit back to user's active plan when resume validation fails
 * @access  Private
 */
router.post('/refund-credit', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required',
        error: 'Missing plan ID in request'
      });
    }
    
    // Find the user plan (read-only lookup, used to distinguish unlimited plans)
    const existing = await UserPlan.findOne({
      _id: planId,
      userId: req.user.userId,
      isActive: true
    }).populate('planId');
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found or not active',
        error: 'The requested user plan does not exist or is not active'
      });
    }
    
    // If plan is unlimited, no need to refund credits
    if (existing.planId.isUnlimited) {
      return res.json({
        success: true,
        message: 'Credit not refunded for unlimited plan',
        userPlan: existing
      });
    }
    
    // Atomic increment, capped at the plan's original credit count. Without
    // the cap this endpoint could be called in a loop to farm free credits.
    const userPlan = await UserPlan.findOneAndUpdate(
      {
        _id: planId,
        userId: req.user.userId,
        isActive: true,
        $expr: { $lt: ['$creditsLeft', existing.planId.credits] }
      },
      { $inc: { creditsLeft: 1 } },
      { new: true }
    ).populate('planId');
    
    if (!userPlan) {
      return res.status(400).json({
        success: false,
        message: 'Refund not applicable',
        error: 'Credits are already at or above the plan maximum'
      });
    }
    
    res.json({
      success: true,
      message: 'Credit refunded successfully',
      userPlan
    });
  } catch (err) {
    console.error('Error refunding credit:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: 'Failed to process credit refund'
    });
  }
});

module.exports = router; 