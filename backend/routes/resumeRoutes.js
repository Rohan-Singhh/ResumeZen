/**
 * Resume Routes
 *
 * Two endpoints, both authenticated:
 *   POST /api/resume/analyze-upload — upload + OCR + AI analysis in one call
 *   GET  /api/resume/history        — the user's past analyses
 *
 * The previous unauthenticated helpers (/parse, /parse-url, /extract-text,
 * /analyze, /ai-analysis, /process) were removed: nothing in the app called
 * them, and they let anyone spend the project's OCR and OpenRouter quota.
 */

const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const { extractResumeTextFromBuffer, analyzeExtraction } = require('../services/resumeParserService');
const { uploadPdfFromBuffer } = require('../services/uploadService');
const authMiddleware = require('../middleware/authMiddleware');
const UserPlan = require('../models/UserPlan');
const ResumeAnalysis = require('../models/ResumeAnalysis');

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

const VALID_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg'
];

// Middleware for handling file uploads
router.use(fileUpload({
  useTempFiles: false, // Avoid disk I/O, keep files in RAM
  limits: { fileSize: MAX_UPLOAD_BYTES },
  abortOnLimit: true
}));

/**
 * Upload + Process directly from RAM
 * POST /api/resume/analyze-upload
 */
router.post('/analyze-upload', authMiddleware, async (req, res) => {
  try {
    if (!req.files || !req.files.resume) {
      return res.status(400).json({ success: false, message: 'No resume file uploaded' });
    }

    const file = req.files.resume;
    const userId = req.user.userId;

    if (!VALID_MIME_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF and image files (PNG, JPG) are allowed'
      });
    }

    // 1. Verify and deduct credit BEFORE uploading to save Cloudinary storage and bandwidth
    const userPlans = await UserPlan.find({ userId, isActive: true }).populate('planId').sort({ purchasedAt: -1 });
    if (!userPlans || userPlans.length === 0) {
      return res.status(403).json({ success: false, message: 'No active plan found' });
    }

    const now = new Date();
    const userPlan = userPlans.find(p =>
      p.planId && (!p.expiresAt || new Date(p.expiresAt) > now) && (p.planId.isUnlimited || p.creditsLeft > 0)
    );

    if (!userPlan) {
      return res.status(403).json({ success: false, message: 'No credits remaining' });
    }

    // Deduct credit
    if (!userPlan.planId.isUnlimited) {
      userPlan.creditsLeft -= 1;
      await userPlan.save();
      console.log(`[analyze-upload] Deducted 1 credit for user ${userId}.`);
    }

    // Refund helper — every failure path below must go through this
    const refund = async (reason) => {
      if (userPlan.planId.isUnlimited) return;
      userPlan.creditsLeft += 1;
      await userPlan.save();
      console.log(`[analyze-upload] Refunded 1 credit for user ${userId}: ${reason}`);
    };

    const options = {
      language: req.body.language || 'eng',
      scale: req.body.scale !== 'false',
      isTable: req.body.isTable === 'true',
      engine: req.body.engine ? parseInt(req.body.engine, 10) : 2,
      model: req.body.model,
      userId,
      planId: userPlan._id
    };

    // 2. Upload to Cloudinary and OCR the buffer concurrently.
    // OCR no longer needs the Cloudinary URL — it reads the bytes we already
    // hold — so the upload is off the critical path.
    const [uploadSettled, extractionSettled] = await Promise.allSettled([
      uploadPdfFromBuffer(file.data, file.name || 'resume.pdf'),
      extractResumeTextFromBuffer(file.data, file.mimetype, options)
    ]);

    if (uploadSettled.status === 'rejected') {
      await refund('Cloudinary upload failed');
      throw new Error('Cloudinary upload failed: ' + uploadSettled.reason?.message);
    }
    const uploadResult = uploadSettled.value;

    if (extractionSettled.status === 'rejected' || !extractionSettled.value.success) {
      const reason = extractionSettled.status === 'rejected'
        ? extractionSettled.reason?.message
        : extractionSettled.value.error;
      await refund('OCR failed');
      return res.status(422).json({
        success: false,
        message: 'Failed to read text from your resume',
        error: reason
      });
    }

    // 3. Analyze the extracted text
    const processResult = await analyzeExtraction(extractionSettled.value, {
      ...options,
      resumeUrl: uploadResult.secure_url
    });

    if (!processResult.success) {
      await refund('analysis failed');
      return res.status(422).json({
        success: false,
        message: 'Failed to process resume',
        error: processResult.error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Resume processed successfully',
      data: processResult.data,
      fileInfo: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      },
      resumeAnalysisId: processResult.data.resumeAnalysisId || null
    });

  } catch (error) {
    console.error('Analyze-Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during analyze and upload',
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
    // Exclude `raw` (the full AI response blob) — it is debug-only and dominates
    // the payload. `.lean()` skips Mongoose document hydration for a read-only list.
    const history = await ResumeAnalysis.find({ userId })
      .select('-raw')
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching resume analysis history:', error);
    return res.status(500).json({ success: false, message: 'Error fetching history', error: error.message });
  }
});

module.exports = router;
