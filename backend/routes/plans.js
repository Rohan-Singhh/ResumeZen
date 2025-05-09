const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// GET /api/plans
// Get all active plans
router.get('/', async (req, res) => {
  try {
    // Find all active plans, sort by price
    const plans = await Plan.find({ active: true })
      .sort({ price: 1 });
    
    if (plans.length === 0) {
      // If no plans are found, try to initialize default plans via the seed script
      try {
        const seedPlans = require('../scripts/seed-plans');
        // Wait a moment for the seed script to run
        setTimeout(async () => {
          const retryPlans = await Plan.find({ active: true }).sort({ price: 1 });
          return res.json({ plans: retryPlans });
        }, 1000);
      } catch (seedError) {
        console.error('Error running seed script:', seedError);
        return res.json({ plans: [] });
      }
    } else {
      res.json({ plans });
    }
  } catch (err) {
    console.error('Error fetching plans:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/plans/:id
// Get a specific plan by ID
router.get('/:id', async (req, res) => {
  try {
    const planId = req.params.id;
    
    // Use our new findByAnyId static method to find by custom ID, planId or regular _id
    const plan = await Plan.findByAnyId(planId);
    
    if (!plan || !plan.active) {
      return res.status(404).json({ error: 'Plan not found or inactive' });
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
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, price, type, value, currency, features, isPopular } = req.body;
    
    if (!name || !price || !type || !value) {
      return res.status(400).json({ error: 'Missing required plan details' });
    }
    
    // Create new plan
    const plan = new Plan({
      name,
      price,
      type,
      value,
      currency: currency || 'INR',
      features: features || [],
      isPopular: isPopular || false,
      active: true
    });
    
    await plan.save();
    
    res.status(201).json({ plan });
  } catch (err) {
    console.error('Error creating plan:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// PUT /api/plans/:id
// Update an existing plan (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Update plan fields
    const updateFields = ['name', 'price', 'type', 'value', 'currency', 'features', 'isPopular', 'active'];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        plan[field] = req.body[field];
      }
    });
    
    await plan.save();
    
    res.json({ plan });
  } catch (err) {
    console.error('Error updating plan:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// DELETE /api/plans/:id
// Deactivate a plan (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
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

// GET /api/plans/stats/all
// Get stats for all plans (admin only)
router.get('/stats/all', adminAuth, async (req, res) => {
  try {
    const stats = await Plan.aggregate([
      { $match: { active: true } },
      {
        $lookup: {
          from: 'purchases',
          localField: '_id',
          foreignField: 'plan',
          as: 'purchases'
        }
      },
      {
        $project: {
          name: 1,
          price: 1,
          type: 1,
          value: 1,
          purchaseCount: { $size: '$purchases' },
          revenue: { 
            $multiply: [
              { $size: '$purchases' },
              '$price'
            ] 
          }
        }
      }
    ]);
    
    res.json({ stats });
  } catch (err) {
    console.error('Error fetching plan stats:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 