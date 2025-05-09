const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  plan: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Plan', 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['success', 'pending', 'failed'], 
    default: 'pending' 
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'bank_transfer', 'other'],
    default: 'other'
  },
  paymentDetails: {
    type: Object
  },
  transactionId: {
    type: String
  },
  activatedAt: Date,
  expiresAt: Date,
  checksRemaining: Number,
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema); 