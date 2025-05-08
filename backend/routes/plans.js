const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Default plans that will be created if none exist
const defaultPlans = [
  {
    planId: 'one-time-check',
    title: "One-Time Check",
    price: 19,
    currency: "INR",
    period: "one-time",
    durationDays: 30,
    type: "basic",
    checksAllowed: 1,
    unlimitedChecks: false,
    features: [
      "1 resume ATS check",
      "Personalized improvement tips",
      "Basic AI analysis",
      "24/7 email support",
      "Export to PDF"
    ],
    isPopular: false,
    isSpecial: false,
    active: true
  },
  {
    planId: 'boost-pack',
    title: "Boost Pack",
    price: 70,
    currency: "INR",
    period: "one-time",
    durationDays: 60,
    type: "pro",
    checksAllowed: 5,
    unlimitedChecks: false,
    features: [
      "5 resume checks",
      "Track improvement history",
      "Advanced AI analysis",
      "Priority email support",
      "Export to multiple formats",
      "LinkedIn profile optimization",
      "Industry-specific keywords"
    ],
    isPopular: true,
    isSpecial: false,
    active: true
  },
  {
    planId: 'unlimited-pack',
    title: "Unlimited Pack",
    price: 500,
    currency: "INR",
    period: "quarterly",
    durationDays: 90,
    type: "premium",
    checksAllowed: 999,
    unlimitedChecks: true,
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
    ],
    isPopular: false,
    isSpecial: true,
    active: true
  }
];

// Initialize default plans if none exist
const initializeDefaultPlans = async () => {
  try {
    const count = await Plan.countDocuments();
    if (count === 0) {
      console.log('No plans found in database. Creating default plans...');
      await Plan.insertMany(defaultPlans);
      console.log('Default plans created successfully.');
    } else {
      console.log(`Found ${count} existing plans in database.`);
    }
  } catch (error) {
    console.error('Error initializing default plans:', error);
  }
};

// Call the initialization function when the module is loaded
initializeDefaultPlans();

// GET /api/plans
// Get all active plans
router.get('/', async (req, res) => {
  try {
    // Find all active plans, sort by price
    const plans = await Plan.find({ active: true })
      .sort({ price: 1 });
    
    if (plans.length === 0) {
      // If no plans are found, try initializing again and reattempt the query
      await initializeDefaultPlans();
      const retryPlans = await Plan.find({ active: true }).sort({ price: 1 });
      return res.json({ plans: retryPlans });
    }
    
    res.json({ plans });
  } catch (err) {
    console.error('Error fetching plans:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/plans/:planId
// Get a specific plan by ID
router.get('/:planId', async (req, res) => {
  try {
    const plan = await Plan.findOne({ planId: req.params.planId, active: true });
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    res.json({ plan });
  } catch (err) {
    console.error('Error fetching plan:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Protected admin routes below

// POST /api/plans
// Create a new plan (admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Verify admin status
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { planId, title, price, currency, period, features, type, checksAllowed, unlimitedChecks } = req.body;
    
    // Check if plan with this ID already exists
    const existingPlan = await Plan.findOne({ planId });
    if (existingPlan) {
      return res.status(400).json({ error: 'Plan with this ID already exists' });
    }
    
    // Create new plan
    const plan = new Plan({
      planId,
      title,
      price,
      currency,
      period,
      features,
      type,
      checksAllowed,
      unlimitedChecks
    });
    
    await plan.save();
    
    res.status(201).json({ plan });
  } catch (err) {
    console.error('Error creating plan:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// PUT /api/plans/:planId
// Update an existing plan (admin only)
router.put('/:planId', auth, async (req, res) => {
  try {
    // Verify admin status
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const plan = await Plan.findOne({ planId: req.params.planId });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Update plan fields
    const updateFields = req.body;
    Object.keys(updateFields).forEach(key => {
      plan[key] = updateFields[key];
    });
    
    await plan.save();
    
    res.json({ plan });
  } catch (err) {
    console.error('Error updating plan:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// DELETE /api/plans/:planId
// Deactivate a plan (admin only)
router.delete('/:planId', auth, async (req, res) => {
  try {
    // Verify admin status
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const plan = await Plan.findOne({ planId: req.params.planId });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Set plan to inactive instead of deleting
    plan.active = false;
    await plan.save();
    
    res.json({ message: 'Plan deactivated successfully' });
  } catch (err) {
    console.error('Error deactivating plan:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 