const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUID: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: String,
  email: String,
  phone: String,
  currentPlan: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Plan' 
  },
  planExpiresAt: Date,
  isAdmin: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 