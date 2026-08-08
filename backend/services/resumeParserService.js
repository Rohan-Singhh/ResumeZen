/**
 * Resume Parser Service
 * 
 * Handles resume parsing and OCR text extraction
 */

const { extractTextFromBuffer } = require('./ocrService');
const { analyzeResume } = require('./aiAnalysisService');
const ResumeAnalysis = require('../models/ResumeAnalysis');

// Section limits (in characters or items)
const SECTION_LIMITS = {
  education: 1000, // max 1000 chars
  qualification: 1000, // max 1000 chars
  skills: 400, // 20 skills * 20 chars
  workExperience: 2000, // max 2000 chars
  certifications: 400, // 20 certs * 20 chars
  summary: 500, // max 500 chars
  projects: 1000, // max 1000 chars
};

// Helper to truncate a section in the text
function truncateSection(text, section, maxLen) {
  // Regex to find section header and up to next section or end.
  // NOTE: the character class must be escaped as `\\s\\S` — inside a template
  // literal `\s` collapses to a bare `s`, which previously compiled this to
  // `[sS]{0,N}` and meant truncation never actually fired.
  const regex = new RegExp(`(${section})([\\s\\S]{0,${maxLen * 2}})`, 'i');
  const match = text.match(regex);
  if (match && match[2].length > maxLen) {
    return text.replace(match[0], match[1] + match[2].slice(0, maxLen) + '\n[Truncated]');
  }
  return text;
}

/**
 * Build the statistics block the frontend shows alongside extracted text.
 * @param {Object} ocrResult - Result from the OCR service
 * @returns {Object} - Extraction payload
 */
const buildExtractionPayload = (ocrResult) => {
  const text = ocrResult.text;
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const avgLineLength = lines.length > 0
    ? lines.reduce((sum, line) => sum + line.length, 0) / lines.length
    : 0;

  return {
    extractedText: text,
    statistics: {
      wordCount: text.split(/\s+/).filter(Boolean).length,
      characterCount: text.length,
      alphanumericCount: (text.match(/[a-zA-Z0-9]/g) || []).length,
      lineCount: lines.length,
      avgLineLength: Math.round(avgLineLength * 100) / 100,
      processingTimeInMs: ocrResult.metadata?.processingTimeInMs || 0
    },
    metadata: ocrResult.metadata || {}
  };
};

/**
 * Normalize caller options into OCR service options.
 * @param {Object} options - Caller options
 * @returns {Object} - OCR options
 */
const toOcrOptions = (options = {}) => ({
  language: options.language || 'eng',
  scale: options.scale !== false,
  isTable: options.isTable === true,
  OCREngine: options.ocrEngine || options.engine || 2
});

/**
 * Extract text from a resume already held in memory.
 * @param {Buffer} buffer - File contents
 * @param {string} mimeType - File MIME type
 * @param {Object} options - OCR options
 * @returns {Promise<Object>} Extracted text and parsed content
 */
const extractResumeTextFromBuffer = async (buffer, mimeType, options = {}) => {
  try {
    const ocrResult = await extractTextFromBuffer(buffer, mimeType, toOcrOptions(options));
    return { success: true, data: buildExtractionPayload(ocrResult) };
  } catch (error) {
    console.error('Resume OCR extraction error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Analyze resume using AI
 * @param {string} text - Resume text to analyze
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} - Analysis results
 */
const analyzeResumeWithAI = async (text, options = {}) => {
  try {
    console.log('Analyzing resume with AI...');
    console.log('Using AI model:', options.model || 'default');
    
    // Validate text input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Invalid or empty resume text provided');
    }
    
    // Call the AI service to analyze the resume
    const analysisResult = await analyzeResume(text, options);

    if (!analysisResult.success) {
      throw new Error(analysisResult.error || 'Failed to analyze resume with AI');
    }

    return {
      success: true,
      data: analysisResult.data
    };
  } catch (error) {
    console.error('Resume AI analysis error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper to detect likely name anywhere in text
function findLikelyName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (
      line.length > 2 && line.length < 40 &&
      !line.match(/@/) && // not an email
      !line.match(/^\d/) // not a number
    ) {
      return line;
    }
  }
  return null;
}

// Helper to detect education keywords anywhere in text
function hasEducationAnywhere(text) {
  return /education|bachelor|master|phd|university|college|school|degree|diploma|qualification/i.test(text);
}

// ─── AI output → ResumeAnalysis document ─────────────────────

const str = (v, fallback = 'NA') =>
  (typeof v === 'string' && v.trim()) ? v.trim() : fallback;

const list = (v) =>
  Array.isArray(v) ? v.filter(item => typeof item === 'string' && item.trim()) : [];

const score = (v) =>
  typeof v === 'number' && Number.isFinite(v)
    ? Math.max(0, Math.min(100, Math.round(v)))
    : 0;

const oneOf = (v, allowed, fallback) => {
  const match = allowed.find(a => a.toLowerCase() === String(v || '').trim().toLowerCase());
  return match || fallback;
};

/**
 * Map a raw AI response onto the ResumeAnalysis schema.
 *
 * Models are inconsistent about types even at temperature 0, so every field is
 * coerced and clamped here rather than trusted. Keeps the persisted shape
 * stable regardless of which model in the fallback chain answered.
 *
 * @param {Object} ai - Parsed model output
 * @param {Object} ctx - Extra context recovered from the OCR text
 * @returns {Object} - Fields ready to persist
 */
function normalizeAnalysis(ai, { likelyName } = {}) {
  const overallScore = score(ai.overallScore);

  return {
    contactInformation: {
      name: str(ai.contactInformation?.name, likelyName || 'NA'),
      email: str(ai.contactInformation?.email),
      phone: str(ai.contactInformation?.phone),
      location: str(ai.contactInformation?.location),
      linkedin: str(ai.contactInformation?.linkedin)
    },
    summary: str(ai.summary),
    skills: {
      technical: list(ai.skills?.technical),
      soft: list(ai.skills?.soft)
    },
    workExperience: Array.isArray(ai.workExperience)
      ? ai.workExperience.map(w => ({
          company: str(w?.company),
          position: str(w?.position),
          duration: str(w?.duration),
          responsibilities: list(w?.responsibilities),
          achievements: list(w?.achievements)
        }))
      : [],
    education: Array.isArray(ai.education)
      ? ai.education.map(e => ({
          institution: str(e?.institution),
          degree: str(e?.degree),
          field: str(e?.field),
          graduationDate: str(e?.graduationDate)
        }))
      : [],
    certifications: list(ai.certifications),

    overallScore,
    hiringRiskLevel: oneOf(
      ai.hiringRiskLevel,
      ['Low', 'Medium', 'High'],
      // Derive from the score when the model omits or mangles the field
      overallScore >= 75 ? 'Low' : overallScore >= 60 ? 'Medium' : 'High'
    ),
    strengths: list(ai.strengths),
    recruiterScreening: {
      verdict: oneOf(
        ai.recruiterScreening?.verdict,
        ['Pass', 'Borderline', 'Reject'],
        overallScore >= 75 ? 'Pass' : overallScore >= 60 ? 'Borderline' : 'Reject'
      ),
      brutalFeedback: list(ai.recruiterScreening?.brutalFeedback),
      redFlags: list(ai.recruiterScreening?.redFlags)
    },
    atsOptimization: {
      score: score(ai.atsOptimization?.score),
      missingKeywords: list(ai.atsOptimization?.missingKeywords),
      formattingIssues: list(ai.atsOptimization?.formattingIssues)
    },
    technicalDepth: {
      score: score(ai.technicalDepth?.score),
      stackRelevance: str(ai.technicalDepth?.stackRelevance),
      overusedBuzzwords: list(ai.technicalDepth?.overusedBuzzwords),
      skillGaps: list(ai.technicalDepth?.skillGaps)
    },
    impactAndOwnership: {
      score: score(ai.impactAndOwnership?.score),
      weakVerbs: list(ai.impactAndOwnership?.weakVerbs),
      missingMetrics: list(ai.impactAndOwnership?.missingMetrics),
      recommendedMetricInjections: list(ai.impactAndOwnership?.recommendedMetricInjections)
    }
  };
}

/**
 * Analyze already-extracted resume text with AI and persist the result.
 *
 * Split out from processResume so the URL path and the in-memory buffer path
 * share one implementation.
 *
 * @param {Object} extraction - Result of extractResumeText / ...FromBuffer
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Processing results
 */
const analyzeExtraction = async (extraction, options = {}) => {
  try {
    const pdfUrl = options.resumeUrl;
    // Truncate overly long sections before AI
    let truncatedText = extraction.data.extractedText;
    for (const [section, maxLen] of Object.entries(SECTION_LIMITS)) {
      truncatedText = truncateSection(truncatedText, section, maxLen);
    }
    // Analyze the extracted text with AI
    const analysis = await analyzeResumeWithAI(truncatedText, options);

    if (!analysis.success) {
      return {
        success: false,
        error: 'We are sorry, but our AI models are currently experiencing high load and could not analyze your resume. Your credit has been refunded. Please try again later.'
      };
    }

    const ai = analysis.data.structured || {};

    // Search the OCR text directly as a safety net for the two fields we use to
    // decide whether the document was a resume at all.
    const likelyName = findLikelyName(extraction.data.extractedText);
    const hasEdu = hasEducationAnywhere(extraction.data.extractedText);

    const record = normalizeAnalysis(ai, { likelyName });

    // Save to ResumeAnalysis if userId and planId are provided
    let savedAnalysis = null;
    if (options.userId && options.planId && pdfUrl) {
      savedAnalysis = await ResumeAnalysis.create({
        userId: options.userId,
        planId: options.planId,
        resumeUrl: pdfUrl,
        ...record,
        raw: analysis.data.raw || null
      });
    }

    // Return success if we recovered anything identifying about the candidate
    if (
      record.contactInformation.name !== 'NA' ||
      record.education.length > 0 ||
      likelyName ||
      hasEdu
    ) {
      return {
        success: true,
        data: {
          extraction: extraction.data,
          analysis: analysis.data,
          resumeAnalysisId: savedAnalysis ? savedAnalysis._id : null,
          warning: null
        }
      };
    }
    // If truly nothing useful, return error
    return {
      success: false,
      error: 'Failed to process resume',
      data: { extraction: extraction.data, analysis: analysis.data },
      status: 422
    };
  } catch (error) {
    console.error('Error processing resume:', error);
    return {
      success: false,
      error: error.message || 'Failed to process resume'
    };
  }
};

module.exports = {
  extractResumeTextFromBuffer,
  analyzeExtraction
};
