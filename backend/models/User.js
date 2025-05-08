const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    sparse: true,
    default: null
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    sparse: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    trim: true,
  },
  profilePicture: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Subscription related fields
  currentPlan: {
    type: String,
    enum: ['no_plan', 'basic', 'pro', 'premium'],
    default: 'no_plan'
  },
  currentPlanId: {
    type: String,
    default: null
  },
  planStartDate: {
    type: Date,
    default: null
  },
  planEndDate: {
    type: Date,
    default: null
  },
  remainingChecks: {
    type: Number,
    default: 0
  },
  hasUnlimitedChecks: {
    type: Boolean,
    default: false
  },
  isSubscriptionActive: {
    type: Boolean,
    default: false
  },
  paymentHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }],
  // Preferences and settings
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: true
  }
});

// Ensure either phone or email is provided
userSchema.pre('save', function(next) {
  if (!this.phone && !this.email) {
    return next(new Error('User must have either a phone number or an email'));
  }
  next();
});

// Virtual for checking if subscription is active
// userSchema.virtual('isSubscriptionActive').get(function() {
//   if (this.currentPlan === 'free') return true;
//   if (!this.planEndDate) return false;
//   return this.planEndDate > new Date();
// });

// Add custom methods
userSchema.methods.canPerformCheck = function() {
  if (this.hasUnlimitedChecks) return true;
  return this.remainingChecks > 0;
};

userSchema.methods.decrementCheck = function() {
  if (this.hasUnlimitedChecks) return true;
  if (this.remainingChecks > 0) {
    this.remainingChecks -= 1;
    return true;
  }
  return false;
};

// Add method to check if subscription is active
userSchema.methods.isSubscriptionValid = function() {
  return this.hasUnlimitedChecks || this.remainingChecks > 0 || (this.planEndDate && this.planEndDate > new Date());
};

// Add a virtual property to get plan status
userSchema.virtual('planStatus').get(function() {
  if (this.hasUnlimitedChecks) {
    return 'unlimited';
  } else if (this.remainingChecks > 0) {
    return `${this.remainingChecks} checks remaining`;
  } else {
    return 'No Plan';
  }
});

// Add it with a different name
userSchema.virtual('subscriptionStatus').get(function() {
  return this.isSubscriptionValid();
});

module.exports = mongoose.model('User', userSchema); 