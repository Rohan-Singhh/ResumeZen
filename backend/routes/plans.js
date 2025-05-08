const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// GET /api/plans
// Get all active plans
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find({ active: true })
      .sort({ price: 1 });
    
    res.json({ plans });
  } catch (err) {
    console.error('Error fetching plans:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/plans/:planId
// Get a specific plan by planId
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

// POST /api/plans (Admin only)
// Create a new plan
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      planId,
      title,
      price,
      currency,
      period,
      durationDays,
      type,
      checksAllowed,
      unlimitedChecks,
      features,
      isPopular,
      isSpecial
    } = req.body;

    // Check if plan with same ID already exists
    const existingPlan = await Plan.findOne({ planId });
    if (existingPlan) {
      return res.status(400).json({ error: 'Plan with this ID already exists' });
    }

    const plan = new Plan({
      planId,
      title,
      price,
      currency,
      period,
      durationDays,
      type,
      checksAllowed,
      unlimitedChecks,
      features,
      isPopular,
      isSpecial
    });

    await plan.save();
    res.status(201).json({ plan });
  } catch (err) {
    console.error('Error creating plan:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// PUT /api/plans/:planId (Admin only)
// Update a plan
router.put('/:planId', adminAuth, async (req, res) => {
  try {
    const plan = await Plan.findOne({ planId: req.params.planId });
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Update plan fields
    const updateFields = [
      'title', 'price', 'currency', 'period', 'durationDays', 
      'type', 'checksAllowed', 'unlimitedChecks', 'features', 
      'isPopular', 'isSpecial', 'active'
    ];
    
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

// DELETE /api/plans/:planId (Admin only)
// Soft delete a plan (set active to false)
router.delete('/:planId', adminAuth, async (req, res) => {
  try {
    const plan = await Plan.findOne({ planId: req.params.planId });
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Soft delete - just mark as inactive
    plan.active = false;
    await plan.save();
    
    res.json({ message: 'Plan deactivated successfully' });
  } catch (err) {
    console.error('Error deactivating plan:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 