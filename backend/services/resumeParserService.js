/**
 * Resume Parser Service
 * 
 * Handles resume parsing and OCR text extraction
 */

const fs = require('fs');
const { extractText } = require('./ocrService');
const { analyzeResume } = require('./aiAnalysisService');
const ResumeAnalysis = require('../models/ResumeAnalysis');

const MAX_EDUCATION_LENGTH = 1000; // Limit for education/qualification text sent to AI

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
  // Regex to find section header and up to next section or end
  const regex = new RegExp(`(${section})([\s\S]{0,${maxLen * 2}})`, 'i');
  const match = text.match(regex);
  if (match && match[2].length > maxLen) {
    return text.replace(match[0], match[1] + match[2].slice(0, maxLen) + '\n[Truncated]');
  }
  return text;
}

/**
 * Basic resume file handling
 * @param {Object} file - File object with tempFilePath or path
 * @returns {Promise<Object>} Basic file information
 */
const parseResume = async (file) => {
  try {
    // Get file path based on upload method
    const filePath = file.tempFilePath || file.path;
    
    if (!filePath) {
      throw new Error('Invalid file: No file path available');
    }
    
    // Just return basic file validation success without detailed parsing
    return {
      success: true,
      data: {
        valid: true,
        filePath,
        fileName: file.name || file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype
      }
    };
  } catch (error) {
    console.error('Resume file processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Extract text content from resume using OCR
 * @param {string} url - URL of the resume file (typically from Cloudinary)
 * @param {Object} options - OCR options
 * @returns {Promise<Object>} Extracted text and parsed content
 */
const extractResumeText = async (url, options = {}) => {
  try {
    console.log('Extracting text from resume URL:', url);
    
    if (!url) {
      throw new Error('URL is required for resume text extraction');
    }
    
    // Default OCR options
    const ocrOptions = {
      language: options.language || 'eng',
      scale: options.scale !== false,
      isTable: options.isTable === true,
      OCREngine: options.ocrEngine || options.engine || 2,
      ...options
    };
    
    // Use OCR service to extract text from the URL
    const ocrResult = await extractText(url, ocrOptions);
    
    if (!ocrResult || !ocrResult.text) {
      throw new Error('Failed to extract text from resume');
    }
    
    // Create word count statistics
    const words = ocrResult.text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    
    // Create character count statistics
    const characterCount = ocrResult.text.length;
    const alphanumericCount = (ocrResult.text.match(/[a-zA-Z0-9]/g) || []).length;
    
    // Analyze text structure (simple heuristics)
    const lines = ocrResult.text.split('\n').filter(line => line.trim().length > 0);
    const avgLineLength = lines.length > 0 ? 
      lines.reduce((sum, line) => sum + line.length, 0) / lines.length : 0;
    
    // Build statistics object
    const statistics = {
      wordCount,
      characterCount,
      alphanumericCount,
      lineCount: lines.length,
      avgLineLength: Math.round(avgLineLength * 100) / 100,
      processingTimeInMs: ocrResult.metadata?.processingTimeInMs || 0
    };
    
    return {
      success: true,
      data: {
        extractedText: ocrResult.text,
        statistics,
        metadata: ocrResult.metadata || {},
        textOverlay: ocrResult.overlay || [],
        rawOcrResult: ocrResult.rawResult
      }
    };
  } catch (error) {
    console.error('Resume OCR extraction error:', error);
    return {
      success: false,
      error: error.message
    };
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
    
    // Check if the analysis was successful
    if (!analysisResult.success) {
      throw new Error(analysisResult.error || 'Failed to analyze resume with AI');
    }
    
    // Check if we're using fallback data
    // The AI service may return success: true but have usedFallback: true
    const usedFallback = analysisResult.data && analysisResult.data.usedFallback === true;
    
    if (usedFallback) {
      console.log('Using fallback AI analysis due to API issues:', 
        analysisResult.data.error || analysisResult.apiError?.message || 'Unknown reason');
    }
    
    return {
      success: true,
      data: analysisResult.data,
      usedFallback: usedFallback
    };
  } catch (error) {
    console.error('Resume AI analysis error:', error);
    return {
      success: false,
      error: error.message,
      usedFallback: false
    };
  }
};

/**
 * Validate if extracted text appears to be from a resume
 * @param {string} text - Extracted text to validate
 * @returns {Object} - Validation result with score and reason
 */
const validateResumeText = (text) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      isResume: false,
      score: 0,
      reasons: ['Empty or invalid text']
    };
  }

  // Calculate validation score based on resume indicators
  let score = 0;
  const reasons = [];
  
  // Check for common resume section keywords
  const sectionKeywords = [
    'experience', 'education', 'skills', 'professional', 'employment', 
    'work history', 'objective', 'summary', 'qualification', 'certifications',
    'projects', 'achievements', 'awards', 'interests', 'languages', 'references'
  ];
  
  // Check for common contact info patterns
  const contactPatterns = [
    /email|e-mail|mail|phone|tel|mobile|contact/i,
    /linkedin\.com/i,
    /github\.com/i,
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email pattern
    /\(\d{3}\)\s*\d{3}[-.\s]?\d{4}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/ // Phone number pattern
  ];
  
  // Check text length
  const textLength = text.trim().length;
  if (textLength < 100) {
    score -= 30;
    reasons.push('Text is too short for a resume');
  } else if (textLength > 100 && textLength < 500) {
    score += 5;
  } else if (textLength >= 500) {
    score += 15;
  }
  
  // Check for section keywords
  let keywordsFound = 0;
  for (const keyword of sectionKeywords) {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      keywordsFound++;
    }
  }
  
  if (keywordsFound === 0) {
    score -= 30;
    reasons.push('No resume section keywords found');
  } else if (keywordsFound < 3) {
    score += 5;
  } else if (keywordsFound >= 3 && keywordsFound < 6) {
    score += 20;
  } else {
    score += 35;
  }
  
  // Check for contact patterns
  let contactPatternsFound = 0;
  for (const pattern of contactPatterns) {
    if (pattern.test(text)) {
      contactPatternsFound++;
    }
  }
  
  if (contactPatternsFound === 0) {
    score -= 20;
    reasons.push('No contact information found');
  } else if (contactPatternsFound >= 1) {
    score += 15;
  }
  
  // Check if this might be another document type
  const nonResumePatterns = [
    { pattern: /invoice|payment|receipt|order|bill|transaction/i, name: 'Invoice/Receipt' },
    { pattern: /letter of recommendation|recommendation letter|reference letter/i, name: 'Recommendation Letter' },
    { pattern: /cover letter|application letter/i, name: 'Cover Letter' },
    { pattern: /agreement|contract|terms|conditions/i, name: 'Agreement/Contract' },
    { pattern: /chapter|page|novel|story|plot|character/i, name: 'Book/Story' },
    { pattern: /essay|article|blog|post/i, name: 'Essay/Article' },
    { pattern: /report|analysis|research/i, name: 'Report' },
    { pattern: /lecture|course|assignment|homework/i, name: 'Academic Document' },
    { pattern: /presentation|slides|powerpoint/i, name: 'Presentation' }
  ];
  
  for (const { pattern, name } of nonResumePatterns) {
    if (pattern.test(text)) {
      score -= 15;
      reasons.push(`Document appears to be a ${name}`);
    }
  }
  
  // Check for table-like data which may suggest non-resume content
  const tablePatterns = [
    /\|\s+\|\s+\|/,  // Markdown tables
    /\+[-+]+\+/,     // ASCII tables
    /┌[─┬]+┐|└[─┴]+┘/ // Unicode box drawings
  ];
  
  for (const pattern of tablePatterns) {
    if (pattern.test(text)) {
      score -= 10;
      reasons.push('Document contains tables which are uncommon in resumes');
      break;
    }
  }
  
  // Make final determination
  score = Math.min(Math.max(score, 0), 100); // Clamp between 0-100
  
  const isResume = score >= 40;
  
  if (!isResume && reasons.length === 0) {
    reasons.push('Document does not contain typical resume content');
  }
  
  return {
    isResume,
    score,
    reasons
  };
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

/**
 * Process resume - extract text and analyze with AI
 * @param {string} pdfUrl - URL of the PDF to process
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Processing results
 */
const processResume = async (pdfUrl, options = {}) => {
  try {
    // First extract text from the PDF
    const extraction = await extractResumeText(pdfUrl, options);
    if (!extraction.success) {
      return {
        success: false,
        error: extraction.error || 'Failed to extract text from PDF'
      };
    }
    // Validate if the extracted text appears to be from a resume
    const validationDetails = validateResumeText(extraction.data.extractedText);
    // Truncate overly long sections before AI
    let truncatedText = extraction.data.extractedText;
    for (const [section, maxLen] of Object.entries(SECTION_LIMITS)) {
      truncatedText = truncateSection(truncatedText, section, maxLen);
    }
    // Analyze the extracted text with AI
    const analysis = await analyzeResumeWithAI(truncatedText, options);
    // Accept fallback/partial results, but add a warning
    let warning = null;
    if (!analysis.success || analysis.data?.error) {
      warning = analysis.error || analysis.data?.error || 'AI analysis failed, fallback used.';
    }
    if (analysis.data?.usedFallback) {
      warning = (warning ? warning + ' ' : '') + 'AI returned fallback analysis.';
    }
    // Defensive: if minimal contact or education info is found, always return an ATS score
    let ai = analysis.data.structured || {};
    // NEW: Search OCR text for likely name and education keywords anywhere
    const likelyName = findLikelyName(extraction.data.extractedText);
    const hasEdu = hasEducationAnywhere(extraction.data.extractedText);
    if (!ai.analysis || typeof ai.analysis.atsScore !== 'number') {
      if (likelyName || hasEdu) {
        ai.analysis = ai.analysis || {};
        ai.analysis.atsScore = 60; // Default for partial resumes
      }
    }
    // Save to ResumeAnalysis if userId and planId are provided
    let savedAnalysis = null;
    if (options.userId && options.planId && pdfUrl) {
      savedAnalysis = await ResumeAnalysis.create({
        userId: options.userId,
        planId: options.planId,
        resumeUrl: pdfUrl,
        contactInformation: {
          name: ai.contactInformation?.name || likelyName || 'NA',
          email: ai.contactInformation?.email || 'NA',
          phone: ai.contactInformation?.phone || 'NA',
          location: ai.contactInformation?.location || 'NA',
          linkedin: ai.contactInformation?.linkedin || 'NA',
        },
        skills: {
          technical: ai.skills?.technical || [],
          soft: ai.skills?.soft || []
        },
        workExperience: Array.isArray(ai.workExperience) ? ai.workExperience.map(w => ({
          company: w.company || 'NA',
          position: w.position || 'NA',
          duration: w.duration || 'NA',
          responsibilities: w.responsibilities || [],
          achievements: w.achievements || []
        })) : [],
        education: Array.isArray(ai.education) ? ai.education.map(e => ({
          institution: e.institution || 'NA',
          degree: e.degree || 'NA',
          field: e.field || 'NA',
          graduationDate: e.graduationDate || 'NA'
        })) : [],
        certifications: ai.certifications || [],
        summary: ai.summary || 'NA',
        analysis: {
          strengths: ai.analysis?.strengths || [],
          areasForImprovement: ai.analysis?.areasForImprovement || [],
          keywords: ai.analysis?.keywords || [],
          atsScore: typeof ai.analysis?.atsScore === 'number'
            ? ai.analysis.atsScore
            : (typeof ai.analysis?.overallAssessmentScore === 'number' ? Math.round(ai.analysis.overallAssessmentScore * 10) : 0)
        },
        raw: analysis.data.raw || analysis.data || null
      });
    }
    // Always return success if we have at least minimal info, with warning if fallback/partial
    if (
      ai.contactInformation?.name ||
      (ai.education && ai.education.length > 0) ||
      likelyName ||
      hasEdu
    ) {
      return {
        success: true,
        data: {
          extraction: extraction.data,
          analysis: analysis.data,
          resumeAnalysisId: savedAnalysis ? savedAnalysis._id : null,
          warning
        }
      };
    }
    // If truly nothing useful, return error
    return {
      success: false,
      error: warning || 'Failed to process resume',
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
  parseResume,
  extractResumeText,
  analyzeResumeWithAI,
  processResume,
  validateResumeText
}; 