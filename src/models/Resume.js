const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  basicInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    location: String,
    linkedIn: String,
    portfolio: String
  },
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    gpa: Number,
    achievements: [String]
  }],
  experience: [{
    company: String,
    position: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: [String],
    achievements: [String]
  }],
  skills: [{
    category: String,
    items: [String]
  }],
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    link: String,
    achievements: [String]
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    link: String
  }],
  atsScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated timestamp on save
resumeSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume; 