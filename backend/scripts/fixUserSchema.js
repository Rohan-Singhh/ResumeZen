require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Plan = require('../models/Plan');

const fixUserSchema = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get default plans for reference
    const plans = await Plan.find({ active: true });
    console.log(`Found ${plans.length} active plans`);
    
    // Find all users
    const users = await User.find();
    console.log(`Found ${users.length} users to update`);
    
    let updatedCount = 0;
    
    // Update each user with missing plan fields
    for (const user of users) {
      let needsUpdate = false;
      const updates = {};
      
      // Check and set currentPlan if missing
      if (!user.currentPlan) {
        updates.currentPlan = user.plan || 'no_plan';
        needsUpdate = true;
      }
      
      // Change 'free' to 'no_plan' for existing users
      if (user.currentPlan === 'free') {
        updates.currentPlan = 'no_plan';
        needsUpdate = true;
      }
      
      // Check and set planStartDate if missing
      if (!user.planStartDate) {
        updates.planStartDate = user.createdAt || new Date();
        needsUpdate = true;
      }
      
      // Check and set remainingChecks if it's null or undefined
      if (user.remainingChecks === undefined || user.remainingChecks === null) {
        updates.remainingChecks = user.hasUnlimitedChecks ? 999 : 0;
        needsUpdate = true;
      }
      
      // Ensure hasUnlimitedChecks is set
      if (user.hasUnlimitedChecks === undefined) {
        updates.hasUnlimitedChecks = false;
        needsUpdate = true;
      }
      
      // Check if user has unlimited plan but hasUnlimitedChecks is false
      if (
        user.currentPlan === 'premium' || 
        (user.currentPlanId && user.currentPlanId.includes('unlimited')) ||
        (user.plan && (user.plan.toLowerCase().includes('unlimited')))
      ) {
        updates.hasUnlimitedChecks = true;
        needsUpdate = true;
      }
      
      // Set isSubscriptionActive based on remaining checks and unlimited status
      updates.isSubscriptionActive = user.hasUnlimitedChecks || (user.remainingChecks > 0) || 
                                   (user.planEndDate && user.planEndDate > new Date());
      needsUpdate = true;
      
      // Update the user if needed
      if (needsUpdate) {
        console.log(`Updating user: ${user.email || user._id}`);
        console.log('Updates:', updates);
        
        await User.findByIdAndUpdate(user._id, { $set: updates });
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} users with schema fixes`);
    
    // Display plan info for a few users as sample
    const sampleUsers = await User.find().limit(3);
    console.log('Sample users after update:');
    sampleUsers.forEach(user => {
      console.log(`- ${user.email || user._id}: Plan: ${user.currentPlan}, Checks: ${user.remainingChecks}, Unlimited: ${user.hasUnlimitedChecks}`);
    });
    
  } catch (error) {
    console.error('Error fixing user schema:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the function
fixUserSchema(); 