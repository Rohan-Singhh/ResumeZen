require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/Plan');

const defaultPlans = [
  {
    planId: 'one-time-check',
    title: "One-Time Check",
    price: 19,
    currency: "INR",
    period: "one-time",
    durationDays: 30,
    type: "basic",
    checksAllowed: 1,
    unlimitedChecks: false,
    features: [
      "1 resume ATS check",
      "Personalized improvement tips",
      "Basic AI analysis",
      "24/7 email support",
      "Export to PDF"
    ],
    isPopular: false,
    isSpecial: false,
    active: true
  },
  {
    planId: 'boost-pack',
    title: "Boost Pack",
    price: 70,
    currency: "INR",
    period: "one-time",
    durationDays: 60,
    type: "pro",
    checksAllowed: 5,
    unlimitedChecks: false,
    features: [
      "5 resume checks",
      "Track improvement history",
      "Advanced AI analysis",
      "Priority email support",
      "Export to multiple formats",
      "LinkedIn profile optimization",
      "Industry-specific keywords"
    ],
    isPopular: true,
    isSpecial: false,
    active: true
  },
  {
    planId: 'unlimited-pack',
    title: "Unlimited Pack",
    price: 500,
    currency: "INR",
    period: "quarterly",
    durationDays: 90,
    type: "premium",
    checksAllowed: 999,
    unlimitedChecks: true,
    features: [
      "Unlimited resume checks",
      "Real-time ATS scoring",
      "Premium AI suggestions",
      "24/7 priority support",
      "All export formats",
      "LinkedIn & GitHub optimization",
      "Custom branding options",
      "Interview preparation tips",
      "Job market insights"
    ],
    isPopular: false,
    isSpecial: true,
    active: true
  }
];

const initPlans = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check for existing plans
    const existingPlans = await Plan.find();
    console.log(`Found ${existingPlans.length} existing plans`);

    // If plans exist, only update them if needed
    if (existingPlans.length > 0) {
      console.log('Updating existing plans...');
      
      for (const defaultPlan of defaultPlans) {
        const existingPlan = existingPlans.find(p => p.planId === defaultPlan.planId);
        
        if (existingPlan) {
          console.log(`Updating plan: ${defaultPlan.title}`);
          await Plan.findByIdAndUpdate(existingPlan._id, defaultPlan);
        } else {
          console.log(`Creating new plan: ${defaultPlan.title}`);
          await Plan.create(defaultPlan);
        }
      }
    } else {
      // If no plans exist, create all default plans
      console.log('No existing plans found. Creating default plans...');
      await Plan.insertMany(defaultPlans);
    }

    console.log('Plan initialization completed successfully');
    
    // Display all plans
    const allPlans = await Plan.find().sort({ price: 1 });
    console.log('Current plans in database:');
    allPlans.forEach(plan => {
      console.log(`- ${plan.title} (${plan.planId}): ${plan.currency} ${plan.price}`);
    });
    
  } catch (error) {
    console.error('Error initializing plans:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the function
initPlans(); 