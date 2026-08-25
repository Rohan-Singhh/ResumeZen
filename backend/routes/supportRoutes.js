const express = require('express');
const { z } = require('zod');
const router = express.Router();
const SupportMessage = require('../models/SupportMessage');
const { sendSupportEmailToAdmin } = require('../services/emailService');
const validate = require('../middleware/validate');

// Mirrors the SupportMessage model's constraints so bad payloads are
// rejected at the boundary with a single clear 400 instead of reaching
// Mongoose and surfacing as per-field validation errors.
const supportMessageSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  subject: z.string().trim().min(1).max(200),
  priority: z.enum(['Low', 'Normal', 'Urgent']).default('Normal'),
  message: z.string().trim().min(1).max(2000)
});

/**
 * @route   POST /api/support
 * @desc    Submit a new support message
 * @access  Public
 */
router.post('/', validate(supportMessageSchema), async (req, res) => {
  try {
    const { name, email, subject, priority, message } = req.body;

    // Create the support message
    const supportMessage = await SupportMessage.create({
      name,
      email,
      subject,
      priority,
      message
    });

    // Send email to admin asynchronously
    sendSupportEmailToAdmin({
      name,
      email,
      subject,
      priority,
      message
    }).catch(err => console.error('Failed to dispatch background email:', err));

    res.status(201).json({
      success: true,
      data: supportMessage,
      message: 'Support message submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting support message:', error);

    // Handle Mongoose validation errors (e.g. edge cases zod allows but the
    // model regex rejects, such as long TLDs)
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
