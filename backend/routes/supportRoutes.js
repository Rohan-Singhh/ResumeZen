const express = require('express');
const router = express.Router();
const SupportMessage = require('../models/SupportMessage');
const { sendSupportEmailToAdmin } = require('../services/emailService');

/**
 * @route   POST /api/support
 * @desc    Submit a new support message
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, priority, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Create the support message
    const supportMessage = await SupportMessage.create({
      name,
      email,
      subject,
      priority: priority || 'Normal',
      message
    });

    // Send email to admin asynchronously
    sendSupportEmailToAdmin({
      name,
      email,
      subject,
      priority: priority || 'Normal',
      message
    }).catch(err => console.error('Failed to dispatch background email:', err));

    res.status(201).json({
      success: true,
      data: supportMessage,
      message: 'Support message submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting support message:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to submit support message. Please try again later.'
    });
  }
});

module.exports = router;
