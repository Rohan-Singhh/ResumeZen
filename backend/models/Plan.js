const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    enum: ['one-time-check', 'boost-pack', 'unlimited-pack'],
  },
  name: {
    type: String,
    required: true,
    enum: ['One-Time Check', 'Boost Pack', 'Unlimited Pack'],
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  period: {
    type: String,
    enum: ['one-time', 'monthly', 'quarterly', 'yearly', '3 months'],
    default: 'one-time',
  },
  credits: {
    type: Number,
    required: true,
  },
  durationInDays: {
    type: Number,
    default: null, // e.g. 90 for 3 months, null for no expiry
  },
  isUnlimited: {
    type: Boolean,
    default: false,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  isSpecial: {
    type: Boolean,
    default: false,
  },
  features: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema); 