const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const auth = require('../middleware/auth');

// POST /api/resumes
// Upload a new resume
router.post('/', auth, async (req, res) => {
  try {
    const { fileURL, fileName, fileSize, jobTitle, industry } = req.body;
    
    if (!fileURL) {
      return res.status(400).json({ error: 'File URL is required' });
    }
    
    // Find the user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find active purchase with available checks
    const activePurchase = await Purchase.findOne({
      user: user._id,
      paymentStatus: 'success',
      $or: [
        // For count-based plans with remaining checks
        { checksRemaining: { $gt: 0 } },
        // For duration-based plans that haven't expired
        { 
          expiresAt: { $gt: new Date() },
          'plan.type': 'duration'
        }
      ]
    }).populate('plan');
    
    if (!activePurchase) {
      return res.status(403).json({ 
        error: 'No active plan with available checks',
        needsPurchase: true
      });
    }
    
    // Create new resume entry
    const resume = new Resume({
      user: user._id,
      fileURL,
      fileName: fileName || 'resume.pdf',
      fileSize: fileSize || 0,
      jobTitle,
      industry,
      uploadedAt: new Date()
    });
    
    await resume.save();
    
    // If this is a count-based plan, reduce the remaining checks
    if (activePurchase.plan.type === 'count' && activePurchase.checksRemaining > 0) {
      activePurchase.checksRemaining -= 1;
      await activePurchase.save();
    }
    
    res.status(201).json({ 
      resume,
      purchaseRemaining: activePurchase.plan.type === 'count' ? 
        activePurchase.checksRemaining : 
        'unlimited'
    });
  } catch (err) {
    console.error('Error uploading resume:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/resumes
// Get all resumes for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.userId })
      .sort({ uploadedAt: -1 });
    
    res.json({ resumes });
  } catch (err) {
    console.error('Error fetching resumes:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/resumes/:id
// Get a specific resume
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    // Ensure the resume belongs to the authenticated user
    if (resume.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to access this resume' });
    }
    
    res.json({ resume });
  } catch (err) {
    console.error('Error fetching resume:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// PATCH /api/resumes/:id/score
// Update the ATS score for a resume
router.patch('/:id/score', auth, async (req, res) => {
  try {
    const { atsScore } = req.body;
    
    if (atsScore === undefined) {
      return res.status(400).json({ error: 'ATS score is required' });
    }
    
    const resume = await Resume.findById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    // Ensure the resume belongs to the authenticated user
    if (resume.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this resume' });
    }
    
    // Update the ATS score
    resume.atsScore = atsScore;
    await resume.save();
    
    res.json({ 
      resume,
      message: 'ATS score updated successfully'
    });
  } catch (err) {
    console.error('Error updating ATS score:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// DELETE /api/resumes/:id
// Delete a resume
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    // Ensure the resume belongs to the authenticated user
    if (resume.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this resume' });
    }
    
    await resume.deleteOne();
    
    res.json({ message: 'Resume deleted successfully' });
  } catch (err) {
    console.error('Error deleting resume:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 