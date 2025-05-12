const mongoose = require('mongoose');

const ResumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAuth',
    required: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserPlan',
    required: true,
  },
  resumeUrl: {
    type: String,
    required: true,
  },
  contactInformation: {
    name: { type: String, default: 'NA' },
    email: { type: String, default: 'NA' },
    phone: { type: String, default: 'NA' },
    location: { type: String, default: 'NA' },
    linkedin: { type: String, default: 'NA' }
  },
  skills: {
    technical: { type: [String], default: [] },
    soft: { type: [String], default: [] }
  },
  workExperience: {
    type: [
      {
        company: { type: String, default: 'NA' },
        position: { type: String, default: 'NA' },
        duration: { type: String, default: 'NA' },
        responsibilities: { type: [String], default: [] },
        achievements: { type: [String], default: [] }
      }
    ],
    default: []
  },
  education: {
    type: [
      {
        institution: { type: String, default: 'NA' },
        degree: { type: String, default: 'NA' },
        field: { type: String, default: 'NA' },
        graduationDate: { type: String, default: 'NA' }
      }
    ],
    default: []
  },
  certifications: { type: [String], default: [] },
  summary: { type: String, default: 'NA' },
  analysis: {
    strengths: { type: [String], default: [] },
    areasForImprovement: { type: [String], default: [] },
    keywords: { type: [String], default: [] },
    atsScore: { type: Number, default: 0 }
  },
  raw: { type: mongoose.Schema.Types.Mixed }, // Store the raw AI response for debugging
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ResumeAnalysis', ResumeAnalysisSchema); 