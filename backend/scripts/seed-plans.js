require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/Plan');

// Default plans based on the new schema
const defaultPlans = [
  { 
    name: "1 Check", 
    customId: "basic_check",
    planId: "plan_basic_check",
    price: 19, 
    type: "count", 
    value: 1,
    currency: "INR",
    features: [
      "1 resume ATS check",
      "Personalized improvement tips",
      "Basic AI analysis",
      "24/7 email support",
      "Export to PDF"
    ],
    active: true
  },
  { 
    name: "5 Checks", 
    customId: "standard_pack",
    planId: "plan_standard_pack",
    price: 70, 
    type: "count", 
    value: 5,
    currency: "INR",
    isPopular: true,
    features: [
      "5 resume checks",
      "Track improvement history",
      "Advanced AI analysis",
      "Priority email support",
      "Export to multiple formats",
      "LinkedIn profile optimization",
      "Industry-specific keywords"
    ],
    active: true
  },
  { 
    name: "3-Month Unlimited", 
    customId: "unlimited_pack",
    planId: "plan_unlimited_pack",
    price: 500, 
    type: "duration", 
    value: 90,
    currency: "INR",
    features: [
      "Unlimited resume checks for 3 months",
      "Real-time ATS scoring",
      "Premium AI suggestions",
      "24/7 priority support",
      "All export formats",
      "LinkedIn & GitHub optimization",
      "Custom branding options",
      "Interview preparation tips",
      "Job market insights"
    ],
    active: true
  }
];

async function seedPlans(useExistingConnection = false) {
  let needToDisconnect = false;

  try {
    // Only connect to MongoDB if not already connected
    if (!useExistingConnection) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ [Seed Script] Connected to MongoDB');
      needToDisconnect = true;
    }
    
    // Check if plans already exist
    const count = await Plan.countDocuments();
    
    if (count === 0) {
      console.log('No plans found in database. Creating default plans...');
      
      // Insert default plans
      await Plan.insertMany(defaultPlans);
      console.log('✅ Default plans created successfully!');
    } else {
      console.log(`Found ${count} existing plans in database. Checking for updates...`);
      
      // Update existing plans with custom IDs if they're missing
      const bulkOps = [];
      
      // Handle known front-end plan IDs by creating them as aliases
      const knownFrontendIds = [
        { pattern: 'plan_standard_kdwtsa32', name: '5 Checks' },
        { pattern: 'plan_unlimited_xlps1n5w', name: '3-Month Unlimited' },
        { pattern: 'plan_basic_check_az4rbg6', name: '1 Check' },
      ];
      
      // Update all existing plans
      for (const plan of await Plan.find()) {
        const update = {};
        
        // If no customId, add one based on name
        if (!plan.customId) {
          update.customId = plan.name.toLowerCase().replace(/\s+/g, '_');
        }
        
        // If no planId, add one based on customId
        if (!plan.planId) {
          update.planId = `plan_${plan.customId || plan.name.toLowerCase().replace(/\s+/g, '_')}`;
        }
        
        // Add to bulk operations if we have updates
        if (Object.keys(update).length > 0) {
          bulkOps.push({
            updateOne: {
              filter: { _id: plan._id },
              update: { $set: update }
            }
          });
        }
      }
      
      // Create or update plans with known frontend IDs
      for (const { pattern, name } of knownFrontendIds) {
        // Find the base plan by name
        const basePlan = await Plan.findOne({ name });
        
        if (basePlan) {
          // Check if this specific pattern already exists
          const existingPlan = await Plan.findOne({ planId: pattern });
          
          if (!existingPlan) {
            console.log(`Adding alias plan ID ${pattern} for ${name}`);
            // Create a new plan with the same details but the frontend ID
            const newPlan = { ...basePlan.toObject() };
            delete newPlan._id; // Remove _id so MongoDB creates a new one
            newPlan.planId = pattern;
            newPlan.customId = pattern.replace('plan_', '');
            await Plan.create(newPlan);
          } else {
            console.log(`Plan ID ${pattern} already exists, skipping`);
          }
        } else {
          console.log(`Base plan with name "${name}" not found, skipping alias creation`);
        }
      }
      
      // Execute bulk operations if any
      if (bulkOps.length > 0) {
        const result = await Plan.bulkWrite(bulkOps);
        console.log(`✅ Updated ${result.modifiedCount} existing plans with custom IDs`);
      } else {
        console.log('No plan updates needed');
      }
    }
    
    // Only disconnect if we connected in this function
    if (needToDisconnect) {
      await mongoose.disconnect();
      console.log('✅ [Seed Script] Disconnected from MongoDB');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    
    // Only disconnect if we connected in this function
    if (needToDisconnect) {
      try {
        await mongoose.disconnect();
      } catch (disconnectError) {
        console.error('Error during disconnect:', disconnectError);
      }
    }
    
    return false;
  }
}

// Only run automatically if this file is executed directly
if (require.main === module) {
  seedPlans();
}

module.exports = seedPlans; 