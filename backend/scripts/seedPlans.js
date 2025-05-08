require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/Plan');

const seedPlans = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing plans
    await Plan.deleteMany({});
    console.log('Cleared existing plans');

    // Define plans based on the pricing data
    const plans = [
      {
        planId: 'one-time-check',
        title: 'One-Time Check',
        price: 19,
        currency: 'INR',
        period: 'one-time',
        durationDays: 30,
        type: 'basic',
        checksAllowed: 1,
        unlimitedChecks: false,
        features: [
          '1 resume ATS check',
          'Personalized improvement tips',
          'Basic AI analysis',
          '24/7 email support',
          'Export to PDF'
        ],
        isPopular: false,
        isSpecial: false,
        active: true
      },
      {
        planId: 'boost-pack',
        title: 'Boost Pack',
        price: 70,
        currency: 'INR',
        period: 'one-time',
        durationDays: 30,
        type: 'pro',
        checksAllowed: 5,
        unlimitedChecks: false,
        features: [
          '5 resume checks',
          'Track improvement history',
          'Advanced AI analysis',
          'Priority email support',
          'Export to multiple formats',
          'LinkedIn profile optimization',
          'Industry-specific keywords'
        ],
        isPopular: true,
        isSpecial: false,
        active: true
      },
      {
        planId: 'unlimited-pack',
        title: 'Unlimited Pack',
        price: 500,
        currency: 'INR',
        period: 'quarterly',
        durationDays: 90, // 3 months
        type: 'premium',
        checksAllowed: 0,
        unlimitedChecks: true,
        features: [
          'Unlimited resume checks',
          'Real-time ATS scoring',
          'Premium AI suggestions',
          '24/7 priority support',
          'All export formats',
          'LinkedIn & GitHub optimization',
          'Custom branding options',
          'Interview preparation tips',
          'Job market insights'
        ],
        isPopular: false,
        isSpecial: true,
        active: true
      }
    ];

    // Insert plans
    await Plan.insertMany(plans);
    console.log('Plans seeded successfully');

    // Exit process
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding plans:', err);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedPlans(); 