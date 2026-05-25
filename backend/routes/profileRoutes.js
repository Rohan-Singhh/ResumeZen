/**
 * Profile Routes
 * Handles all user profile-related API endpoints
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { uploadImage } = require('../services/uploadService');
const UserAuth = require('../models/UserAuth');
const UserProfile = require('../models/UserProfile');
const UserLinks = require('../models/UserLinks');
const authMiddleware = require('../middleware/authMiddleware');
const admin = require('firebase-admin');

/**
 * @route   GET /api/profile
 * @desc    Get current user's profile data
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get user data from UserAuth
    const userAuth = await UserAuth.findById(req.user.userId);
    if (!userAuth) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'User account not found'
      });
    }

    // Get profile data if it exists
    const userProfile = await UserProfile.findOne({ userId: req.user.userId });

    // Get links data if it exists
    const userLinks = await UserLinks.findOne({ userId: req.user.userId });

    // Combine all user data
    const userData = {
      _id: userAuth._id,
      name: userAuth.fullName,
      email: userAuth.email,
      phone: userAuth.mobileNumber,
      lastLoginAt: userAuth.lastLoginAt,
      // Add profile data if available
      ...(userProfile && {
        occupation: userProfile.occupation,
        graduationYear: userProfile.graduationYear,
        avatarUrl: userProfile.avatarUrl,
        completedTasks: userProfile.completedTasks || []
      }),
      // Add links data if available
      ...(userLinks && {
        linkedin: userLinks.linkedin,
        github: userLinks.github,
        website: userLinks.website,
        bio: userLinks.bio
      })
    };

    res.json({
      success: true,
      user: userData
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: 'Failed to retrieve profile data'
    });
  }
});

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/', authMiddleware, async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      occupation,
      graduationYear,
      linkedin,
      github,
      website,
      bio,
      completedTasks
    } = req.body;

    // Update UserAuth
    const userAuth = await UserAuth.findById(req.user.userId);
    if (!userAuth) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'User account not found'
      });
    }

    // Update basic info
    if (fullName) userAuth.fullName = fullName;
    if (mobileNumber) userAuth.mobileNumber = mobileNumber;
    await userAuth.save();

    // Find or create UserProfile
    let userProfile = await UserProfile.findOne({ userId: req.user.userId });
    if (!userProfile) {
      userProfile = new UserProfile({ userId: req.user.userId });
    }

    // Update profile data
    if (occupation !== undefined) userProfile.occupation = occupation;
    if (graduationYear !== undefined) userProfile.graduationYear = graduationYear;
    if (completedTasks !== undefined) userProfile.completedTasks = completedTasks;
    await userProfile.save();

    // Find or create UserLinks
    let userLinks = await UserLinks.findOne({ userId: req.user.userId });
    if (!userLinks) {
      userLinks = new UserLinks({ userId: req.user.userId });
    }

    // Update links data
    if (linkedin !== undefined) userLinks.linkedin = linkedin;
    if (github !== undefined) userLinks.github = github;
    if (website !== undefined) userLinks.website = website;
    if (bio !== undefined) userLinks.bio = bio;
    await userLinks.save();

    // Combine all updated user data for response
    const updatedUserData = {
      _id: userAuth._id,
      name: userAuth.fullName,
      email: userAuth.email,
      phone: userAuth.mobileNumber,
      lastLoginAt: userAuth.lastLoginAt,
      occupation: userProfile.occupation,
      graduationYear: userProfile.graduationYear,
      avatarUrl: userProfile.avatarUrl,
      completedTasks: userProfile.completedTasks || [],
      linkedin: userLinks.linkedin,
      github: userLinks.github,
      website: userLinks.website,
      bio: userLinks.bio
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUserData
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: 'Failed to update profile data'
    });
  }
});

/**
 * @route   POST /api/profile/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadImage(req.file);
    
    let userProfile = await UserProfile.findOne({ userId: req.user.userId });
    if (!userProfile) {
      userProfile = new UserProfile({ userId: req.user.userId });
    }
    
    userProfile.avatarUrl = result.url;
    await userProfile.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: result.url
    });
  } catch (err) {
    console.error('Error uploading avatar:', err);
    res.status(500).json({ success: false, message: 'Failed to upload avatar' });
  }
});

/**
 * @route   DELETE /api/profile
 * @desc    Delete user account and data
 * @access  Private
 */
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const firebaseUid = req.user.firebaseUid;
    
    // Delete profile and links
    await UserProfile.deleteOne({ userId });
    await UserLinks.deleteOne({ userId });
    
    // Delete auth record
    await UserAuth.findByIdAndDelete(userId);

    // Delete from Firebase using Admin SDK (bypasses recent-login requirements)
    if (firebaseUid && admin.apps.length > 0) {
      try {
        await admin.auth().deleteUser(firebaseUid);
        console.log(`Deleted Firebase user: ${firebaseUid}`);
      } catch (fbErr) {
        console.error('Error deleting Firebase user:', fbErr);
        // We continue even if this fails, since DB is already cleaned
      }
    }

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
});

module.exports = router; 