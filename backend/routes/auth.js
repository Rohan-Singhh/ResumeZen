const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('firebase-admin');
const rateLimit = require('express-rate-limit');
const serviceAccount = require('../resumezen-7d5f2-firebase-adminsdk-fbsvc-0d1d6acd61.json');

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

// Create a specific rate limiter for phone authentication
const phoneAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes',
    retryAfter: 900 // seconds (15 minutes)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// POST /api/auth/phone
// Expects: { idToken: string }
router.post('/phone', phoneAuthLimiter, async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'idToken is required' });

  try {
    console.log('Received ID token for verification');
    
    // Check if this is an emulator token in development mode
    if (isDevelopmentMode && idToken.startsWith('emulator-token-')) {
      console.log('Detected emulator token, using development verification flow');
      
      // In development mode with emulator, we can bypass token verification
      // Extract phone number from a custom header or the token itself
      // For our mock emulator, we'll just use a default phone number
      const phone = '+15555555555'; // Default phone for development
      
      console.log('Development mode: Using phone number:', phone);
      
      // Find or create user
      let user = await User.findOne({ phone });
      if (!user) {
        console.log('Creating new user for phone:', phone);
        user = await User.create({ phone, isPhoneVerified: true });
      } else if (!user.isPhoneVerified) {
        user.isPhoneVerified = true;
        await user.save();
      }
      
      // Issue JWT
      const token = jwt.sign({ userId: user._id, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: '7d' });
      console.log('JWT token issued successfully for development mode');
      
      // Return success
      return res.json({ 
        token, 
        user: { 
          phone: user.phone, 
          isPhoneVerified: user.isPhoneVerified, 
          _id: user._id 
        },
        developmentMode: true
      });
    }
    
    // Regular production flow: Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('Token verified successfully');
    
    // In emulator, the token format might be different
    // so we need to handle both formats
    const phone = decodedToken.phone_number || decodedToken.phoneNumber;
    
    if (!phone) {
      console.error('No phone number in token:', decodedToken);
      return res.status(400).json({ error: 'Invalid phone number' });
    }
    
    console.log('Phone authentication successful for:', phone);

    // Find or create user
    let user = await User.findOne({ phone });
    if (!user) {
      console.log('Creating new user for phone:', phone);
      user = await User.create({ phone, isPhoneVerified: true });
    } else if (!user.isPhoneVerified) {
      user.isPhoneVerified = true;
      await user.save();
    }

    // Issue JWT
    const token = jwt.sign({ userId: user._id, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('JWT token issued successfully');
    
    res.json({ 
      token, 
      user: { 
        phone: user.phone, 
        isPhoneVerified: user.isPhoneVerified, 
        _id: user._id 
      } 
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ error: 'Invalid or expired token', details: err.message });
  }
});

// POST /api/auth/google
// Expects: { idToken: string }
router.post('/google', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'idToken is required' });

  try {
    console.log('Received Google ID token for verification');
    
    // Check if this is an emulator token in development mode
    if (isDevelopmentMode && idToken.startsWith('emulator-token-')) {
      console.log('Detected emulator token for Google auth, using development verification flow');
      
      // For development mode, we can use a mock Google account
      const email = 'test@example.com';
      const name = 'Test User';
      
      console.log('Development mode: Using email:', email);
      
      // Find or create user by email
      let user = await User.findOne({ email });
      if (!user) {
        console.log('Creating new user for email:', email);
        user = await User.create({ 
          email, 
          name,
          isEmailVerified: true 
        });
      }
      
      // Issue JWT
      const token = jwt.sign({ 
        userId: user._id, 
        email: user.email 
      }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      console.log('JWT token issued successfully for development mode Google auth');
      
      // Return success
      return res.json({ 
        token, 
        user: { 
          email: user.email, 
          name: user.name,
          _id: user._id 
        },
        developmentMode: true
      });
    }
    
    try {
      // Regular production flow: Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('Google token verified successfully');
      
      // Get user data from token
      const { email, name, picture } = decodedToken;
      
      if (!email) {
        console.error('No email in token:', decodedToken);
        return res.status(400).json({ error: 'Invalid email' });
      }
      
      console.log('Google authentication successful for:', email);

      // Find or create user by email
      let user = await User.findOne({ email });
      if (!user) {
        console.log('Creating new user for email:', email);
        try {
          user = await User.create({ 
            email, 
            name: name || email.split('@')[0],
            profilePicture: picture,
            isEmailVerified: true,
            phone: undefined  // Explicitly set to undefined instead of null
          });
        } catch (createError) {
          console.error('Error creating user:', createError);
          
          // Try to diagnose the issue
          if (createError.code === 11000) {
            // Duplicate key error - try to work around it
            console.log('Attempting to work around duplicate key error...');
            
            // Create with random suffix to ensure uniqueness
            const timestamp = Date.now();
            user = await User.create({ 
              email: `${email}+${timestamp}`, // Add a unique suffix
              name: name || email.split('@')[0],
              profilePicture: picture,
              isEmailVerified: true,
              phone: undefined
            });
            
            console.log('Successfully created user with modified email');
          } else {
            // Re-throw any other errors
            throw createError;
          }
        }
      } else {
        // Update profile data if needed
        let needsUpdate = false;
        
        if (name && user.name !== name) {
          user.name = name;
          needsUpdate = true;
        }
        
        if (picture && user.profilePicture !== picture) {
          user.profilePicture = picture;
          needsUpdate = true;
        }
        
        if (!user.isEmailVerified) {
          user.isEmailVerified = true;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await user.save();
        }
      }

      // Issue JWT
      const token = jwt.sign({ 
        userId: user._id, 
        email: user.email 
      }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      console.log('JWT token issued successfully for Google auth');
      
      res.json({ 
        token, 
        user: { 
          email: user.email, 
          name: user.name,
          profilePicture: user.profilePicture,
          _id: user._id 
        } 
      });
    } catch (verifyError) {
      console.error('Error verifying Google token:', verifyError);
      return res.status(401).json({ 
        error: 'Invalid Google ID token', 
        details: verifyError.message 
      });
    }
  } catch (err) {
    console.error('Google authentication error:', err);
    res.status(500).json({ 
      error: 'Server error during Google authentication', 
      details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Diagnostic route for admins only - check database indexes
if (process.env.NODE_ENV === 'development') {
  router.get('/debug/indexes', async (req, res) => {
    try {
      const User = require('../models/User');
      
      // Get collection info
      const collection = User.collection;
      const indexes = await collection.indexes();
      
      // Find and count documents with null phone
      const nullPhoneCount = await User.countDocuments({ phone: null });
      
      // Get a sample of users
      const users = await User.find().limit(10).lean();
      
      res.json({
        message: 'MongoDB index diagnostic information',
        indexes,
        nullPhoneCount,
        sampleUsers: users.map(u => ({
          id: u._id,
          email: u.email,
          phone: u.phone === null ? 'NULL' : (u.phone || 'undefined'),
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