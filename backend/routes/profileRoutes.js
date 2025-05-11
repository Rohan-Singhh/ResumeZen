/**
 * Profile Routes
 * Handles all user profile-related API endpoints
 */

const express = require('express');
const router = express.Router();
const UserAuth = require('../models/UserAuth');
const UserProfile = require('../models/UserProfile');
const UserLinks = require('../models/UserLinks');
const authMiddleware = require('../middleware/authMiddleware');

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
      // Add profile data if available
      ...(userProfile && {
        occupation: userProfile.occupation,
        graduationYear: userProfile.graduationYear
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
      bio
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
      occupation: userProfile.occupation,
      graduationYear: userProfile.graduationYear,
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

module.exports = router; 