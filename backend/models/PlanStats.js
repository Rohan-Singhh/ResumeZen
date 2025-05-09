const mongoose = require('mongoose');

const planStatsSchema = new mongoose.Schema({
  plan: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Plan' 
  },
  activeUsers: Number,
  totalPurchases: Number,
  revenue: Number,
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('PlanStats', planStatsSchema); 