/**
 * Resume Routes
 * 
 * Handles resume uploads to Cloudinary
 */

const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const { parseResume } = require('../services/resumeParserService');
const { uploadPdf } = require('../services/uploadService');
const axios = require('axios');

// Middleware for handling file uploads
router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
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
    
    // Validate file type (PDF only)
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed'
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

module.exports = router; 