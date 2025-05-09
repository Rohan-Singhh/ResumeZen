const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  fileURL: { 
    type: String, 
    required: true 
  },
  atsScore: Number,
  jobTitle: String,
  industry: String,
  fileName: String,
  fileSize: Number,
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  },
}, { timestamps: true });

// Index for efficient queries
resumeSchema.index({ user: 1, uploadedAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema); 