const mongoose = require('mongoose');

const UserPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAuth',
    required: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  creditsLeft: {
    type: Number,
    required: true,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

// Credit checks always look up active plans for a user, newest purchase first
UserPlanSchema.index({ userId: 1, isActive: 1, purchasedAt: -1 });

module.exports = mongoose.model('UserPlan', UserPlanSchema); 