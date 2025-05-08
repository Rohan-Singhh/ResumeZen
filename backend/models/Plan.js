const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  planId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  period: {
    type: String,
    enum: ['one-time', 'monthly', 'quarterly', 'yearly'],
    default: 'one-time'
  },
  durationDays: {
    type: Number,
    default: 30 // Default to 30 days
  },
  type: {
    type: String,
    enum: ['free', 'basic', 'pro', 'premium'],
    default: 'basic'
  },
  checksAllowed: {
    type: Number,
    default: 1
  },
  unlimitedChecks: {
    type: Boolean,
    default: false
  },
  features: [{
    type: String
  }],
  isPopular: {
    type: Boolean,
    default: false
  },
  isSpecial: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update updatedAt field
planSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Plan', planSchema); 