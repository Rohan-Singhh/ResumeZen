const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

// GET /api/users/me
// Get the authenticated user's profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-__v');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Calculate if subscription is active
    const isSubscriptionActive = user.currentPlan === 'free' ? 
      true : 
      (user.planEndDate ? user.planEndDate > new Date() : false);
    
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        currentPlan: user.currentPlan,
        currentPlanId: user.currentPlanId,
        planStartDate: user.planStartDate,
        planEndDate: user.planEndDate,
        remainingChecks: user.remainingChecks,
        hasUnlimitedChecks: user.hasUnlimitedChecks,
        isSubscriptionActive,
        createdAt: user.createdAt
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
    const { name, email, phone, emailNotifications, smsNotifications } = req.body;
    
    // Find the user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    
    // Only update email if it's different and valid
    if (email && email !== user.email) {
      // Check if email is already in use
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      user.email = email;
      user.isEmailVerified = false; // Require verification of new email
    }
    
    // Only update phone if it's different and valid
    if (phone && phone !== user.phone) {
      // Check if phone is already in use
      const existingUser = await User.findOne({ phone });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ error: 'Phone number already in use' });
      }
      user.phone = phone;
      user.isPhoneVerified = false; // Require verification of new phone
    }
    
    // Update notification preferences
    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) user.smsNotifications = smsNotifications;
    
    await user.save();
    
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        emailNotifications: user.emailNotifications,
        smsNotifications: user.smsNotifications
      }
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/users/me/payments
// Get payment history for authenticated user
router.get('/me/payments', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    
    res.json({ payments });
  } catch (err) {
    console.error('Error fetching payment history:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 