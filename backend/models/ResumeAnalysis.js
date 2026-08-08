const mongoose = require('mongoose');

/**
 * ResumeAnalysis
 *
 * Shape mirrors what the AI actually returns (see getAnalysisPrompt in
 * services/aiAnalysisService.js). Two groups of fields:
 *
 *  - Extraction: contactInformation, skills, workExperience, education,
 *    certifications, summary. Drives the dashboard KPIs, the health radar,
 *    and the user profile sent to POST /api/jobs/match.
 *  - Audit: overallScore, hiringRiskLevel, recruiterScreening, atsOptimization,
 *    technicalDepth, impactAndOwnership, strengths. Drives the detail report.
 *
 * The legacy `analysis` subdocument is no longer written but is kept in the
 * schema so records created before the migration still deserialize.
 */
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

  // ─── Extraction ──────────────────────────────────────────
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
        _id: false,
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
        _id: false,
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

  // ─── Audit ───────────────────────────────────────────────
  overallScore: { type: Number, default: 0, min: 0, max: 100 },
  hiringRiskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Unknown'],
    default: 'Unknown'
  },
  strengths: { type: [String], default: [] },
  recruiterScreening: {
    verdict: {
      type: String,
      enum: ['Pass', 'Borderline', 'Reject', 'Unknown'],
      default: 'Unknown'
    },
    brutalFeedback: { type: [String], default: [] },
    redFlags: { type: [String], default: [] }
  },
  atsOptimization: {
    score: { type: Number, default: 0, min: 0, max: 100 },
    missingKeywords: { type: [String], default: [] },
    formattingIssues: { type: [String], default: [] }
  },
  technicalDepth: {
    score: { type: Number, default: 0, min: 0, max: 100 },
    stackRelevance: { type: String, default: 'NA' },
    overusedBuzzwords: { type: [String], default: [] },
    skillGaps: { type: [String], default: [] }
  },
  impactAndOwnership: {
    score: { type: Number, default: 0, min: 0, max: 100 },
    weakVerbs: { type: [String], default: [] },
    missingMetrics: { type: [String], default: [] },
    recommendedMetricInjections: { type: [String], default: [] }
  },

  // ─── Legacy (read-only; written by pre-migration records) ─
  analysis: {
    type: {
      _id: false,
      strengths: { type: [String], default: undefined },
      areasForImprovement: { type: [String], default: undefined },
      missingKeywords: { type: [String], default: undefined },
      keywords: { type: [String], default: undefined },
      atsScore: { type: Number, default: undefined }
    },
    default: undefined
  },

  raw: { type: mongoose.Schema.Types.Mixed }, // Store the raw AI response for debugging
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// History is always read as "this user's analyses, newest first"
ResumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ResumeAnalysis', ResumeAnalysisSchema);
