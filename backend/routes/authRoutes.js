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
const path = require('path');
const fs = require('fs');

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  // Connect to Firebase Auth Emulator in development mode
  if (process.env.NODE_ENV === 'development') {
    // For Firebase Admin SDK, set environment variables before initialization
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
    console.log('Using Firebase Auth Emulator in backend at:', process.env.FIREBASE_AUTH_EMULATOR_HOST);
  }
  
  try {
    // Get service account path from environment variable
    const serviceAccountPath = process.env.FIREBASE_ADMIN_SDK_PATH;
    
    if (!serviceAccountPath) {
      throw new Error('FIREBASE_ADMIN_SDK_PATH environment variable is not set');
    }
    
    // Resolve path to the service account file
    const fullServiceAccountPath = path.resolve(__dirname, '..', serviceAccountPath.replace(/^\.\//, ''));
    
    // Check if the file exists
    if (!fs.existsSync(fullServiceAccountPath)) {
      throw new Error(`Firebase Admin SDK service account file not found at: ${fullServiceAccountPath}`);
    }
    
    // Load the service account file
    const serviceAccount = require(fullServiceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
  }
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
    // First try to find user by email to avoid duplicate key errors
    let user = null;
    
    if (userData.email) {
      user = await UserAuth.findOne({ email: userData.email });
      console.log(`Checking for existing user with email ${userData.email}: ${user ? 'Found' : 'Not found'}`);
    }
    
    // If not found by email, try to find by firebaseUID
    if (!user) {
      user = await UserAuth.findOne({ firebaseUid: firebaseUID });
      console.log(`Checking for existing user with firebaseUID ${firebaseUID}: ${user ? 'Found' : 'Not found'}`);
    }
    
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
      
      // Add phone if provided (for backward compatibility)
      if (userData.phone) {
        userAuthData.mobileNumber = userData.phone;
      }
      
      // Set primary auth method to Google if it's a Gmail account
      if (userData.email && userData.email.includes('@gmail.com')) {
        userAuthData.primaryAuthMethod = 'google';
        userAuthData.authType = 'google';
      } else if (userData.email) {
        userAuthData.primaryAuthMethod = 'email';
        userAuthData.authType = 'email';
      }
      
      // Create new user
      console.log('Creating new user with data:', JSON.stringify(userAuthData, null, 2));
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
      // (kept for backward compatibility)
      if (userData.phone && (!user.mobileNumber || user.mobileNumber !== userData.phone)) {
        user.mobileNumber = userData.phone;
        needsUpdate = true;
      }
      
      // Update authType if needed
      if (userData.email && userData.email.includes('@gmail.com')) {
        if (user.authType !== 'google') {
          user.authType = 'google';
          needsUpdate = true;
        }
        
        if (user.primaryAuthMethod !== 'google') {
          user.primaryAuthMethod = 'google';
          needsUpdate = true;
        }
      } else if (userData.email) {
        if (user.authType !== 'email') {
          user.authType = 'email';
          needsUpdate = true;
        }
        
        if (user.primaryAuthMethod !== 'email') {
          user.primaryAuthMethod = 'email';
          needsUpdate = true;
        }
      }
      
      // Update Firebase UID if it's different (for linking accounts)
      if (user.firebaseUid !== firebaseUID) {
        console.log(`Updating Firebase UID from ${user.firebaseUid} to ${firebaseUID}`);
        user.firebaseUid = firebaseUID;
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
        authType: 'email' 
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
    
    // Determine auth type - only support Google or email now
    let authType = 'email';
    if (email && email.includes('@gmail.com')) {
      authType = 'google';
    }
    
    // Prepare user data from token
    const userData = {
      name,
      email,
      phone, // Keep phone for data continuity
      authType,
      primaryAuthMethod: authType
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
 * @deprecated - This endpoint is maintained for backward compatibility but not used by the frontend anymore
 */
router.post('/phone', async (req, res) => {
  console.log('Phone auth endpoint called');
  console.warn('DEPRECATED: Phone authentication is no longer supported in the UI');
  
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
      
      // Generate a unique development email to avoid duplicates
      const uniqueId = Date.now().toString().slice(-6);
      
      const userData = {
        name: 'Development User', // Consistent name
        email: `dev.user${uniqueId}@resumezen.com`, // Use unique email to avoid duplicates
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
        
        // Try to recover if it's a duplicate key error
        if (devError.code === 11000 && devError.keyPattern && devError.keyPattern.email) {
          try {
            console.log('Attempting to recover from duplicate email error');
            // Find the user with the duplicate email
            const existingUser = await UserAuth.findOne({ email: devError.keyValue.email });
            
            if (existingUser) {
              console.log('Found existing user with email, generating token');
              // Generate a token for the existing user
              const token = jwt.sign(
                { 
                  userId: existingUser._id, 
                  firebaseUid: existingUser.firebaseUid,
                  authType: existingUser.authType,
                  primaryAuthMethod: existingUser.primaryAuthMethod
                }, 
                process.env.JWT_SECRET, 
                { expiresIn: '7d' }
              );
              
              return res.json({
                success: true,
                token,
                user: {
                  _id: existingUser._id,
                  name: existingUser.fullName,
                  email: existingUser.email,
                  phone: existingUser.mobileNumber,
                  authType: existingUser.authType,
                  primaryAuthMethod: existingUser.primaryAuthMethod
                },
                developmentMode: true,
                recoveredFromError: true
              });
            }
          } catch (recoveryError) {
            console.error('Error during recovery attempt:', recoveryError);
          }
        }
        
        return res.status(500).json({
          success: false,
          message: 'Development server error',
          error: devError.message || 'Error processing development mode authentication',
          code: devError.code || 'unknown'
        });
      }
    }
    
    // Production flow starts here  
    return res.status(400).json({
      success: false,
      message: 'Phone authentication has been deprecated',
      error: 'This authentication method is no longer supported'
    });
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
      
      // Generate a unique development email to avoid duplicates
      const uniqueId = Date.now().toString().slice(-6);
      
      // Use a fixed email for development to avoid confusion
      const userData = {
        name: 'Development User',
        email: `dev.user${uniqueId}@resumezen.com`, // Use unique email to avoid duplicates
        authType: 'google',
        primaryAuthMethod: 'google'
      };
      
      // Try to extract email from the emulator token if possible
      if (idToken !== 'development-token' && idToken !== 'test-token') {
        try {
          // Attempt to verify and extract data from emulator token
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          if (decodedToken && decodedToken.email) {
            // For development, add a suffix to avoid conflicts with existing users
            const originalEmail = decodedToken.email;
            const emailName = originalEmail.split('@')[0];
            const emailDomain = originalEmail.split('@')[1] || 'example.com';
            userData.email = `${emailName}.dev${uniqueId}@${emailDomain}`;
            userData.name = decodedToken.name || decodedToken.displayName || 'Development User';
            console.log('Using modified email from emulator token:', userData.email);
          }
        } catch (err) {
          console.log('Could not extract email from emulator token, using default:', err.message);
        }
      }
      
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
        
        // Try to recover if it's a duplicate key error
        if (devError.code === 11000 && devError.keyPattern && devError.keyPattern.email) {
          try {
            console.log('Attempting to recover from duplicate email error');
            // Find the user with the duplicate email
            const existingUser = await UserAuth.findOne({ email: devError.keyValue.email });
            
            if (existingUser) {
              console.log('Found existing user with email, generating token');
              // Generate a token for the existing user
              const token = jwt.sign(
                { 
                  userId: existingUser._id, 
                  firebaseUid: existingUser.firebaseUid,
                  authType: existingUser.authType,
                  primaryAuthMethod: existingUser.primaryAuthMethod
                }, 
                process.env.JWT_SECRET, 
                { expiresIn: '7d' }
              );
              
              return res.json({
                success: true,
                token,
                user: {
                  _id: existingUser._id,
                  name: existingUser.fullName,
                  email: existingUser.email,
                  phone: existingUser.mobileNumber,
                  authType: existingUser.authType,
                  primaryAuthMethod: existingUser.primaryAuthMethod
                },
                developmentMode: true,
                recoveredFromError: true
              });
            }
          } catch (recoveryError) {
            console.error('Error during recovery attempt:', recoveryError);
          }
        }
        
        return res.status(500).json({
          success: false,
          message: 'Development server error',
          error: devError.message || 'Error processing development mode authentication',
          code: devError.code || 'unknown'
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
      const name = decodedToken.name || decodedToken.displayName || email?.split('@')[0] || 'User';
      
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
        authType: 'google',
        primaryAuthMethod: 'google'
      };
      
      console.log('Creating/updating user with Google data:', { name, email });
      
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