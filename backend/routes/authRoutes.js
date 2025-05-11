/**
 * Authentication Routes
 * Handles all authentication-related API endpoints
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const UserAuth = require('../models/UserAuth');
const UserProfile = require('../models/UserProfile');
const UserLinks = require('../models/UserLinks');
const admin = require('firebase-admin');
const rateLimit = require('express-rate-limit');
const serviceAccount = require('../resumezen-7d5f2-firebase-adminsdk-fbsvc-0d1d6acd61.json');

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  // Connect to Firebase Auth Emulator in development mode
  if (process.env.NODE_ENV === 'development') {
    // For Firebase Admin SDK, set environment variables before initialization
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
    console.log('Using Firebase Auth Emulator in backend at:', process.env.FIREBASE_AUTH_EMULATOR_HOST);
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Check if we're in development mode (using emulator)
const isDevelopmentMode = process.env.NODE_ENV === 'development';

// Function to check if a token is from Firebase Auth Emulator
const isEmulatorToken = (token) => {
  // In development with Firebase Auth Emulator, tokens have distinct format
  return token.startsWith('eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0') || // Emulator token format
         token.includes('firebase-auth-emulator') ||                // Content marker
         token === 'development-token' ||                          // Our own dev token
         token === 'test-token' ||                                // Test token
         token.startsWith('emulator-token-') ||                   // Emulator prefix
         (process.env.NODE_ENV === 'development' && 
          token.startsWith('eyJ'));                               // Any JWT in dev mode as fallback
};

// Create a specific rate limiter for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts',
    error: 'Too many login attempts from this IP, please try again after 15 minutes',
    retryAfter: 900 // seconds (15 minutes)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Helper function to create or update user and generate token
 * @param {string} firebaseUID - Firebase user ID
 * @param {Object} userData - User data to store
 * @returns {Promise<Object>} User and token data
 */
const handleAuthUser = async (firebaseUID, userData) => {
  try {
    // Find user by firebaseUID
    let user = await UserAuth.findOne({ firebaseUid: firebaseUID });
    
    if (!user) {
      // Prepare user data for creation
      const userAuthData = {
        firebaseUid: firebaseUID,
        fullName: userData.name || null,
        authType: userData.authType || 'both',
        primaryAuthMethod: userData.primaryAuthMethod || userData.authType || 'both'
      };
      
      // Add email if provided
      if (userData.email) {
        userAuthData.email = userData.email;
      }
      
      // Add phone if provided
      if (userData.phone) {
        userAuthData.mobileNumber = userData.phone;
      }
      
      // Verify at least one auth method is provided
      if (!userData.email && !userData.phone) {
        throw new Error('Either email or phone must be provided for authentication');
      }
      
      // Set primary auth method based on provided data if not explicitly set
      if (!userAuthData.primaryAuthMethod || userAuthData.primaryAuthMethod === 'both') {
        if (userData.authType === 'google') {
          userAuthData.primaryAuthMethod = 'google';
        } else if (userData.authType === 'phone') {
          userAuthData.primaryAuthMethod = 'phone';
        } else if (userData.authType === 'email') {
          userAuthData.primaryAuthMethod = 'email';
        } else if (userData.email && userData.email.includes('@gmail.com')) {
          userAuthData.primaryAuthMethod = 'google';
        } else if (userData.email) {
          userAuthData.primaryAuthMethod = 'email';
        } else if (userData.phone) {
          userAuthData.primaryAuthMethod = 'phone';
        }
      }
      
      // Create new user
      user = await UserAuth.create(userAuthData);
      console.log('Created new user with firebaseUid:', firebaseUID);
      
      // Initialize empty UserProfile for the new user
      await UserProfile.create({
        userId: user._id
      });
      
      // Initialize empty UserLinks for the new user
      await UserLinks.create({
        userId: user._id
      });
    } else {
      // Update existing user data if needed
      let needsUpdate = false;
      
      // Check if name needs updating
      if (userData.name && user.fullName !== userData.name) {
        user.fullName = userData.name;
        needsUpdate = true;
      }
      
      // Check if email needs updating - only update if provided
      if (userData.email && (!user.email || user.email !== userData.email)) {
        user.email = userData.email;
        needsUpdate = true;
      }
      
      // Check if phone number needs updating - only update if provided
      if (userData.phone && (!user.mobileNumber || user.mobileNumber !== userData.phone)) {
        user.mobileNumber = userData.phone;
        needsUpdate = true;
      }
      
      // Update authType if needed
      if (userData.authType && user.authType !== userData.authType) {
        user.authType = userData.authType;
        needsUpdate = true;
      } else {
        // Recalculate authType based on available fields
        let newAuthType = 'both';
        if (user.email && user.mobileNumber) {
          newAuthType = 'both';
        } else if (user.email) {
          newAuthType = user.email.includes('@gmail.com') ? 'google' : 'email';
        } else if (user.mobileNumber) {
          newAuthType = 'phone';
        }
        
        if (user.authType !== newAuthType) {
          user.authType = newAuthType;
          needsUpdate = true;
        }
      }
      
      // Update primaryAuthMethod if provided explicitly
      if (userData.primaryAuthMethod && user.primaryAuthMethod !== userData.primaryAuthMethod) {
        user.primaryAuthMethod = userData.primaryAuthMethod;
        needsUpdate = true;
      }
      
      // Update lastLoginAt
      user.lastLoginAt = new Date();
      needsUpdate = true;
      
      if (needsUpdate) {
        await user.save();
        console.log('Updated existing user data for:', firebaseUID);
      }
    }
    
    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing in environment variables');
      throw new Error('Server configuration error: JWT_SECRET missing');
    }
    
    // Generate JWT token with better error handling
    try {
      const token = jwt.sign(
        { 
          userId: user._id, 
          firebaseUid: firebaseUID,
          authType: user.authType,
          primaryAuthMethod: user.primaryAuthMethod
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      return { user, token };
    } catch (jwtError) {
      console.error('JWT token generation error:', jwtError);
      throw new Error('Failed to generate authentication token');
    }
  } catch (error) {
    console.error('Error in handleAuthUser:', error);
    // Rethrow with additional information
    throw error;
  }
};

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify Firebase ID token
 * @access  Public
 */
router.post('/verify-token', authLimiter, async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ 
    success: false,
    message: 'Missing token',
    error: 'idToken is required' 
  });

  try {
    console.log('Received ID token for verification');
    
    // Check if this is an emulator token in development mode
    if (isDevelopmentMode && isEmulatorToken(idToken)) {
      console.log('Detected emulator token, using development verification flow');
      
      // For development mode, create a fake UID and user data
      const firebaseUID = 'dev-' + Date.now();
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+15555555555',
        authType: 'both'
      };
      
      const { user, token } = await handleAuthUser(firebaseUID, userData);
      
      return res.json({ 
        success: true,
        token, 
        user: { 
          _id: user._id,
          name: user.fullName,
          email: user.email,
          phone: user.mobileNumber,
          authType: user.authType,
          primaryAuthMethod: user.primaryAuthMethod
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
    
    // Determine auth type
    let authType = 'both';
    if (email && phone) {
      authType = 'both';
    } else if (email) {
      authType = email.includes('@gmail.com') ? 'google' : 'email';
    } else if (phone) {
      authType = 'phone';
    }
    
    // Prepare user data from token
    const userData = {
      name,
      email,
      phone,
      authType
    };
    
    // Handle authentication (create/update user and generate token)
    const { user, token } = await handleAuthUser(firebaseUID, userData);
    
    // Return user data and token
    res.json({ 
      success: true,
      token, 
      user: { 
        _id: user._id,
        name: user.fullName,
        email: user.email,
        phone: user.mobileNumber,
        authType: user.authType,
        primaryAuthMethod: user.primaryAuthMethod
      } 
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ 
      success: false,
      message: 'Authentication failed',
      error: 'Invalid or expired token'
    });
  }
});

/**
 * @route   POST /api/auth/phone
 * @desc    Authenticate with phone number via Firebase
 * @access  Public
 */
router.post('/phone', async (req, res) => {
  console.log('Phone auth endpoint called');
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      console.error('Missing idToken in request body');
      return res.status(400).json({ 
        success: false,
        message: 'Missing token',
        error: 'idToken is required'
      });
    }

    console.log('Received idToken for phone authentication', idToken.substring(0, 10) + '...');

    // Special handling for development mode and emulator tokens
    if (isDevelopmentMode && 
        (isEmulatorToken(idToken) || 
         idToken === 'development-token' ||
         idToken === 'test-token')) {
      console.log('Using development/emulator verification flow for phone auth');
      
      let firebaseUID;
      
      // For real emulator tokens, try to verify them with the emulator
      if (idToken !== 'development-token' && idToken !== 'test-token' && !idToken.startsWith('emulator-token-')) {
        try {
          // Try to verify with Firebase Auth Emulator
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          console.log('Successfully verified emulator token:', decodedToken.uid);
          firebaseUID = decodedToken.uid;
        } catch (emulatorError) {
          console.log('Could not verify emulator token, using fallback:', emulatorError.message);
          firebaseUID = 'dev-phone-' + Date.now();
        }
      } else {
        // For development tokens, create a fake UID
        firebaseUID = 'dev-phone-' + Date.now();
      }
      
      const userData = {
        name: 'Phone User',
        phone: '+15555555555',
        authType: 'phone',
        primaryAuthMethod: 'phone'
      };
      
      try {
        const { user, token } = await handleAuthUser(firebaseUID, userData);
        
        return res.json({ 
          success: true,
          token, 
          user: { 
            _id: user._id,
            name: user.fullName,
            email: user.email,
            phone: user.mobileNumber,
            authType: user.authType,
            primaryAuthMethod: user.primaryAuthMethod
          },
          developmentMode: true
        });
      } catch (devError) {
        console.error('Error in development flow:', devError);
        return res.status(500).json({
          success: false,
          message: 'Development server error',
          error: devError.message || 'Error processing development mode authentication'
        });
      }
    }
    
    // Production flow starts here
    try {
      // Verify the Firebase ID token
      console.log('Verifying Firebase ID token for phone auth...');
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('Phone token verified successfully:', decodedToken.uid);
      
      // Extract user data from token
      const firebaseUID = decodedToken.uid;
      const phone = decodedToken.phone_number || null;
      
      // Log the phone number for debugging
      console.log('Phone number from token:', phone);
      
      // Generate a name if not available
      const name = decodedToken.name || 'User-' + firebaseUID.substring(0, 6);
      
      // Update userData to include authType
      const userData = {
        name: name || null,
        phone: phone || null,
        email: decodedToken.email || null,
        authType: 'phone',
        primaryAuthMethod: 'phone'
      };
      
      console.log('Creating/updating user with data:', JSON.stringify(userData));
      
      // Handle authentication (create/update user and generate token)
      const { user, token } = await handleAuthUser(firebaseUID, userData);
      
      // Return user data and token
      return res.json({ 
        success: true,
        token, 
        user: { 
          _id: user._id,
          name: user.fullName,
          email: user.email,
          phone: user.mobileNumber,
          authType: user.authType,
          primaryAuthMethod: user.primaryAuthMethod
        } 
      });
    } catch (verifyError) {
      // Detailed error for Firebase token verification
      console.error('Firebase token verification error:', verifyError);
      
      // If in development mode, attempt a fallback authentication
      if (isDevelopmentMode) {
        console.log('Attempting development fallback auth after verification error');
        try {
          const firebaseUID = 'dev-fallback-' + Date.now();
          const userData = {
            name: 'Development User',
            phone: '+10000000000'
          };
          
          const { user, token } = await handleAuthUser(firebaseUID, userData);
          
          return res.json({
            success: true,
            token,
            user: {
              _id: user._id,
              name: user.fullName,
              email: user.email,
              phone: user.mobileNumber
            },
            developmentMode: true,
            fallback: true
          });
        } catch (fallbackError) {
          console.error('Even fallback auth failed:', fallbackError);
        }
      }
      
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: verifyError.message || 'Invalid Firebase token'
      });
    }
  } catch (err) {
    console.error('Phone auth error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message || 'Server error during phone authentication'
    });
  }
});

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate with Google via Firebase
 * @access  Public
 */
router.post('/google', async (req, res) => {
  console.log('Google auth endpoint called');
  
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      console.error('Missing idToken in request body');
      return res.status(400).json({ 
        success: false,
        message: 'Missing token',
        error: 'idToken is required'
      });
    }

    console.log('Received idToken for Google authentication');

    // Development mode handling
    if (isDevelopmentMode && 
        (isEmulatorToken(idToken) || 
         idToken === 'development-token' ||
         idToken === 'test-token')) {
      console.log('Using development verification flow for Google auth');
      
      const firebaseUID = 'dev-google-' + Date.now();
      const userData = {
        name: 'Google User',
        email: 'google.user' + Date.now() + '@gmail.com',
        phone: null,
        authType: 'google',
        primaryAuthMethod: 'google'
      };
      
      try {
        const { user, token } = await handleAuthUser(firebaseUID, userData);
        
        return res.json({ 
          success: true,
          token, 
          user: { 
            _id: user._id,
            name: user.fullName,
            email: user.email,
            phone: user.mobileNumber,
            authType: user.authType,
            primaryAuthMethod: user.primaryAuthMethod
          },
          developmentMode: true
        });
      } catch (devError) {
        console.error('Error in development flow:', devError);
        return res.status(500).json({
          success: false,
          message: 'Development server error',
          error: devError.message || 'Error processing development mode authentication'
        });
      }
    }
    
    // Production flow starts here
    try {
      // Verify the Firebase ID token
      console.log('Verifying Firebase ID token for Google auth...');
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('Google token verified successfully:', decodedToken.uid);
      
      // Extract user data from token
      const firebaseUID = decodedToken.uid;
      const email = decodedToken.email || null;
      const name = decodedToken.name || email?.split('@')[0] || 'User';
      const phone = decodedToken.phone_number || null;
      
      // Ensure email is present for Google auth
      if (!email) {
        console.error('Missing email in Google auth token');
        return res.status(400).json({
          success: false,
          message: 'Invalid token',
          error: 'Email is required for Google authentication'
        });
      }
      
      // Prepare user data from token
      const userData = {
        name,
        email,
        phone,
        authType: 'google',
        primaryAuthMethod: 'google'
      };
      
      console.log('Creating/updating user with Google data:', JSON.stringify(userData));
      
      // Handle authentication (create/update user and generate token)
      const { user, token } = await handleAuthUser(firebaseUID, userData);
      
      // Return user data and token
      return res.json({ 
        success: true,
        token, 
        user: { 
          _id: user._id,
          name: user.fullName,
          email: user.email,
          phone: user.mobileNumber,
          authType: user.authType,
          primaryAuthMethod: user.primaryAuthMethod
        } 
      });
    } catch (verifyError) {
      console.error('Firebase token verification error:', verifyError);
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: verifyError.message || 'Invalid Firebase token'
      });
    }
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message || 'Server error during Google authentication'
    });
  }
});

module.exports = router; 