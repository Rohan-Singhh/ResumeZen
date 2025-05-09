const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('firebase-admin')
const rateLimit = require('express-rate-limit');
const serviceAccount = require('../resumezen-7d5f2-firebase-adminsdk-fbsvc-0d1d6acd61.json');
const mongoose = require('mongoose');

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  // Connect to Firebase Auth Emulator in development mode
  if (process.env.NODE_ENV === 'development') {
    // For Firebase Admin SDK, we set environment variables before initialization
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
    console.log('Using Firebase Auth Emulator in backend at:', process.env.FIREBASE_AUTH_EMULATOR_HOST);
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Check if we're in development mode (using emulator)
const isDevelopmentMode = process.env.NODE_ENV === 'development';

// Create a specific rate limiter for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes',
    retryAfter: 900 // seconds (15 minutes)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Helper function to create or update user and generate token
const handleAuthUser = async (firebaseUID, userData) => {
  // Find user by firebaseUID
  let user = await User.findOne({ firebaseUID });
  
  if (!user) {
    // Create new user if not found
    user = await User.create({
      firebaseUID,
      ...userData
    });
    console.log('Created new user with firebaseUID:', firebaseUID);
  } else {
    // Update existing user data if needed
    let needsUpdate = false;
    
    // Check if any fields need updating
    Object.keys(userData).forEach(key => {
      if (userData[key] && user[key] !== userData[key]) {
        user[key] = userData[key];
        needsUpdate = true;
      }
    });
    
    if (needsUpdate) {
      await user.save();
      console.log('Updated existing user data for:', firebaseUID);
    }
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, firebaseUID }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
  
  return { user, token };
};

// POST /api/auth/verify-token
// Unified endpoint for verifying Firebase tokens
router.post('/verify-token', authLimiter, async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'idToken is required' });

  try {
    console.log('Received ID token for verification');
    
    // Check if this is an emulator token in development mode
    if (isDevelopmentMode && idToken.startsWith('emulator-token-')) {
      console.log('Detected emulator token, using development verification flow');
      
      // For development mode, we'll create a fake UID and user data
      const firebaseUID = 'dev-' + Date.now();
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+15555555555'
      };
      
      const { user, token } = await handleAuthUser(firebaseUID, userData);
      
      return res.json({ 
        token, 
        user: { 
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        developmentMode: true
      });
    }
    
    // Production flow: Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('Token verified successfully');
    
    // Extract user data from token
    const firebaseUID = decodedToken.uid;
    const email = decodedToken.email;
    const phone = decodedToken.phone_number || decodedToken.phoneNumber;
    const name = decodedToken.name || email?.split('@')[0] || 'User';
    
    // Prepare user data from token
    const userData = {
      name,
      email,
      phone
    };
    
    // Handle authentication (create/update user and generate token)
    const { user, token } = await handleAuthUser(firebaseUID, userData);
    
    // Return user data and token
    res.json({ 
      token, 
      user: { 
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currentPlan: user.currentPlan,
        planExpiresAt: user.planExpiresAt
      } 
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ error: 'Invalid or expired token', details: err.message });
  }
});

// For backwards compatibility - replace the redirects with direct handling
router.post('/phone', async (req, res) => {
  console.log('Phone auth endpoint called');
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }

    // Development mode handling
    if (isDevelopmentMode && idToken.startsWith('emulator-token-')) {
      console.log('Detected emulator token, using development verification flow');
      
      // For development mode, we'll create a fake UID and user data
      const firebaseUID = 'dev-' + Date.now();
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+15555555555'
      };
      
      const { user, token } = await handleAuthUser(firebaseUID, userData);
      
      return res.json({ 
        token, 
        user: { 
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        developmentMode: true
      });
    }
    
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('Phone token verified successfully');
    
    // Extract user data from token
    const firebaseUID = decodedToken.uid;
    const phone = decodedToken.phone_number || null;
    const name = decodedToken.name || 'User';
    
    // Prepare user data from token - important to include null checks
    const userData = {
      name: name || null,
      phone: phone || null
    };
    
    // Handle authentication (create/update user and generate token)
    const { user, token } = await handleAuthUser(firebaseUID, userData);
    
    // Return user data and token
    res.json({ 
      token, 
      user: { 
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currentPlan: user.currentPlan,
        planExpiresAt: user.planExpiresAt
      } 
    });
  } catch (err) {
    console.error('Phone auth error:', err);
    res.status(500).json({ error: 'Server error during phone authentication', details: err.message });
  }
});

router.post('/google', async (req, res) => {
  console.log('Google auth endpoint called');
  try {
    // Same implementation as verify-token but specific for Google
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }
    
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Extract user data
    const firebaseUID = decodedToken.uid;
    const email = decodedToken.email || null;
    const name = decodedToken.name || email?.split('@')[0] || 'User';
    
    // Create/update user
    const userData = {
      name,
      email,
    };
    
    const { user, token } = await handleAuthUser(firebaseUID, userData);
    
    // Return response
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currentPlan: user.currentPlan,
        planExpiresAt: user.planExpiresAt
      }
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Server error during Google authentication', details: err.message });
  }
});

// Diagnostic route for admins only - check database
if (process.env.NODE_ENV === 'development') {
  router.get('/debug/users', async (req, res) => {
    try {
      const User = require('../models/User');
      
      // Get a sample of users
      const users = await User.find().limit(10).lean();
      
      res.json({
        message: 'User diagnostic information',
        sampleUsers: users.map(u => ({
          id: u._id,
          firebaseUID: u.firebaseUID,
          email: u.email,
          phone: u.phone,
          name: u.name
        }))
      });
    } catch (error) {
      console.error('Error in diagnostic route:', error);
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = router; 