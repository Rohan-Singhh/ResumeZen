const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const { validateUser } = require('../middleware/validation');
// const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register user
router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    try {
      // Dummy response for now
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: '123',
          email: req.body.email,
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Login user
router.post('/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // Dummy response for now
      res.status(200).json({
        message: 'Login successful',
        token: 'dummy_token_123',
        user: {
          id: '123',
          email: req.body.email,
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    // Dummy response for now
    res.status(200).json({
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile',
  [
    body('name').trim().optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Dummy response for now
      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: '123',
          name: req.body.name || 'Test User',
          email: req.body.email || 'test@example.com'
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router; 