const mongoose = require('mongoose');

const UserAuthSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: function() {
      // Email is required only if mobileNumber is not provided
      return !this.mobileNumber;
    },
    lowercase: true,
    sparse: true,
  },
  mobileNumber: {
    type: String,
    required: function() {
      // mobileNumber is required only if email is not provided
      return !this.email;
    },
    sparse: true,
  },
  fullName: {
    type: String,
    required: false,
  },
  authType: {
    type: String,
    enum: ['email', 'phone', 'google', 'both'],
    required: true,
    default: 'both'
  },
  primaryAuthMethod: {
    type: String,
    enum: ['email', 'phone', 'google'],
    required: true,
    default: function() {
      if (this.email && this.email.includes('@gmail.com')) return 'google';
      if (this.email) return 'email';
      return 'phone';
    }
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save middleware to ensure at least one of email or mobileNumber is provided
UserAuthSchema.pre('save', function(next) {
  if (!this.email && !this.mobileNumber) {
    return next(new Error('Either email or mobileNumber must be provided'));
  }
  
  // Set the auth type based on provided credentials
  if (this.email && this.mobileNumber) {
    this.authType = 'both';
  } else if (this.email) {
    this.authType = this.email.includes('@gmail.com') ? 'google' : 'email';
  } else if (this.mobileNumber) {
    this.authType = 'phone';
  }
  
  // Set primaryAuthMethod if not already set
  if (!this.primaryAuthMethod) {
    if (this.email && this.email.includes('@gmail.com')) {
      this.primaryAuthMethod = 'google';
    } else if (this.email) {
      this.primaryAuthMethod = 'email';
    } else if (this.mobileNumber) {
      this.primaryAuthMethod = 'phone';
    }
  }
  
  next();
});

module.exports = mongoose.model('UserAuth', UserAuthSchema); 