/**
 * Resume Routes
 * 
 * Handles resume uploads to Cloudinary
 */

const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const { parseResume, extractResumeText, analyzeResumeWithAI, processResume } = require('../services/resumeParserService');
const { uploadPdf } = require('../services/uploadService');
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');
const UserPlan = require('../models/UserPlan');
const ResumeAnalysis = require('../models/ResumeAnalysis');

// Middleware for handling file uploads
router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  abortOnLimit: true
}));

/**
 * Parse Resume endpoint
 * POST /api/resume/parse
 * Uploads the file to Cloudinary and returns the URL
 */
router.post('/parse', async (req, res) => {
  try {
    // Check for file in the request
    if (!req.files || !req.files.resume) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.files.resume;
    
    // Validate file type (PDF, images)
    const validMimeTypes = [
      'application/pdf', 
      'image/png', 
      'image/jpeg', 
      'image/jpg'
    ];
    
    if (!validMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF and image files (PNG, JPG) are allowed'
      });
    }

    // Upload the file to Cloudinary
    const uploadResult = await uploadPdf(file);
    
    // Basic validation of the file
    const parseResult = await parseResume(file);

    if (!parseResult.success) {
      return res.status(422).json({
        success: false,
        message: 'Unable to process resume file',
        error: parseResult.error,
        uploadInfo: uploadResult // Still return upload info so the file is not lost
      });
    }

    // Return Cloudinary info
    const responseData = {
      fileInfo: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        resourceType: uploadResult.resource_type,
        size: uploadResult.bytes,
        originalName: file.name,
        createdAt: uploadResult.created_at
      }
    };

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing resume',
      error: error.message
    });
  }
});

/**
 * Parse from URL endpoint
 * POST /api/resume/parse-url
 * Simply returns the URL (for existing Cloudinary uploads)
 */
router.post('/parse-url', async (req, res) => {
  try {
    const { resumeUrl, publicId } = req.body;
    
    if (!resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Resume URL is required'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Resume URL processed successfully',
      data: {
        fileInfo: {
          url: resumeUrl,
          publicId: publicId
        }
      }
    });
  } catch (error) {
    console.error('Resume URL processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing resume URL',
      error: error.message
    });
  }
});

/**
 * Extract text from resume endpoint
 * POST /api/resume/extract-text
 * Uses OCR to extract text from a resume URL
 */
router.post('/extract-text', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Resume URL is required'
      });
    }
    
    console.log('Extracting text from resume URL:', url);
    
    // Get OCR options from request
    const options = {
      language: req.body.language || 'eng',
      scale: req.body.scale !== 'false',
      isTable: req.body.isTable === 'true',
      ocrEngine: req.body.engine ? parseInt(req.body.engine, 10) : 2
    };
    
    // Use OCR service to extract text
    const extractionResult = await extractResumeText(url, options);
    
    if (!extractionResult.success) {
      return res.status(422).json({
        success: false,
        message: 'Failed to extract text from resume',
        error: extractionResult.error
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Text extracted successfully from resume',
      data: extractionResult.data
    });
  } catch (error) {
    console.error('Text extraction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error extracting text from resume',
      error: error.message
    });
  }
});

/**
 * Analyze resume endpoint
 * POST /api/resume/analyze
 * Analyzes a resume URL using OCR and provides basic stats
 */
router.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Resume URL is required'
      });
    }
    
    // Get OCR options from request
    const options = {
      language: req.body.language || 'eng',
      scale: req.body.scale !== 'false',
      isTable: req.body.isTable === 'true',
      ocrEngine: req.body.engine ? parseInt(req.body.engine, 10) : 2
    };
    
    // Extract text with OCR
    const extractionResult = await extractResumeText(url, options);
    
    if (!extractionResult.success) {
      return res.status(422).json({
        success: false,
        message: 'Failed to extract text from resume',
        error: extractionResult.error
      });
    }
    
    // Return the extracted text with basic statistics
    return res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: {
        extractedText: extractionResult.data.extractedText,
        statistics: extractionResult.data.statistics,
        metadata: extractionResult.data.metadata
      }
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error analyzing resume',
      error: error.message
    });
  }
});

/**
 * Process resume endpoint (OCR + AI)
 * POST /api/resume/process
 * Extracts text with OCR and analyzes it with AI
 */
router.post('/process', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Resume URL is required'
      });
    }
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No userId in request context'
      });
    }
    // Find active user plan with credits
    const userPlan = await UserPlan.findOne({
      userId,
      isActive: true
    }).populate('planId');
    if (!userPlan) {
      return res.status(403).json({
        success: false,
        message: 'No active plan found. Please purchase a plan.'
      });
    }
    if (!userPlan.planId.isUnlimited && userPlan.creditsLeft <= 0) {
      return res.status(403).json({
        success: false,
        message: 'No credits remaining. Please buy more checks.'
      });
    }
    // Deduct credit if not unlimited
    if (!userPlan.planId.isUnlimited) {
      userPlan.creditsLeft -= 1;
      await userPlan.save();
      console.log(`[process] Deducted 1 credit for user ${userId}, plan ${userPlan._id}. Credits left: ${userPlan.creditsLeft}`);
    } else {
      console.log(`[process] Unlimited plan for user ${userId}, no credit deduction.`);
    }
    // Build processing options from request
    const options = {
      language: req.body.language || 'eng',
      scale: req.body.scale !== 'false',
      isTable: req.body.isTable === 'true',
      engine: req.body.engine ? parseInt(req.body.engine, 10) : 2,
      model: req.body.model || 'meta-llama/llama-4-maverick:free',
      prompt: req.body.prompt,
      systemPrompt: req.body.systemPrompt,
      userId,
      planId: userPlan._id,
      resumeUrl: url
    };
    // Use the resume parser service to process the resume
    const processResult = await processResume(url, options);
    if (!processResult.success) {
      // If analysis fails, refund credit if not unlimited
      if (!userPlan.planId.isUnlimited) {
        userPlan.creditsLeft += 1;
        await userPlan.save();
        console.log(`[process] Refunded 1 credit for user ${userId} due to analysis failure.`);
      }
      return res.status(422).json({
        success: false,
        message: 'Failed to process resume',
        error: processResult.error
      });
    }
    // Check if we're using fallback analysis
    const usedFallback = processResult.data.analysis?.usedFallback || false;
    // Return appropriate response
    return res.status(200).json({
      success: true,
      message: usedFallback ? 'Resume processed with fallback AI analysis' : 'Resume processed successfully',
      data: processResult.data,
      options: {
        language: options.language,
        engine: options.engine,
        model: options.model
      },
      usedFallback,
      resumeAnalysisId: processResult.data.resumeAnalysisId || null
    });
  } catch (error) {
    console.error('Resume processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing resume',
      error: error.message
    });
  }
});

/**
 * AI Analysis endpoint
 * POST /api/resume/ai-analysis
 * Analyzes resume text using AI
 */
router.post('/ai-analysis', async (req, res) => {
  try {
    const { text, model, prompt, systemPrompt } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is required'
      });
    }
    
    console.log('Analyzing resume text with AI, model:', model || 'default');
    
    // Options for AI analysis
    const options = {
      model: model || 'meta-llama/llama-4-maverick:free',
      prompt: prompt,
      systemPrompt: systemPrompt
    };
    
    // Use AI service to analyze text
    const analysisResult = await analyzeResumeWithAI(text, options);
    
    // If the analysis used fallback data but still succeeded
    if (analysisResult.success && analysisResult.usedFallback) {
      return res.status(200).json({
        success: true,
        message: 'Resume text analyzed with fallback system',
        data: analysisResult.data,
        model: options.model,
        usedFallback: true
      });
    }
    
    // If the analysis completely failed with no fallback
    if (!analysisResult.success) {
      return res.status(422).json({
        success: false,
        message: 'Failed to analyze resume with AI',
        error: analysisResult.error
      });
    }
    
    // Success without fallback
    return res.status(200).json({
      success: true,
      message: 'Resume text analyzed successfully',
      data: analysisResult.data,
      model: options.model
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error analyzing resume with AI',
      error: error.message
    });
  }
});

/**
 * Get resume analysis history for the authenticated user
 * GET /api/resume/history
 * Returns all ResumeAnalysis records for the user, most recent first
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const history = await ResumeAnalysis.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching resume analysis history:', error);
    return res.status(500).json({ success: false, message: 'Error fetching history', error: error.message });
  }
});

module.exports = router; 