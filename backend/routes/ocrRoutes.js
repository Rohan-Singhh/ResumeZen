/**
 * OCR Routes
 * Handles endpoints for text extraction from documents
 */

const express = require('express');
const router = express.Router();
const ocrService = require('../services/ocrService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/temp');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, PNG, JPG and JPEG files are allowed'));
    }
  }
});

/**
 * @route   POST /api/ocr/extract
 * @desc    Extract text from uploaded document
 * @access  Private
 */
router.post('/extract', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const filePath = req.file.path;
    
    // Optional parameters from request body
    const options = {
      language: req.body.language || 'eng', // Default to English
      scale: req.body.scale !== 'false', // Scale the image (default: true)
      isTable: req.body.isTable === 'true', // Table mode for structured data
      OCREngine: req.body.engine ? parseInt(req.body.engine, 10) : 2
    };
    
    // Send to OCR service
    const result = await ocrService.extractText(filePath, options);
    
    // Delete temp file after processing
    fs.unlinkSync(filePath);
    
    // Determine if client wants full details or just text
    const responseFormat = req.query.format || 'standard';
    
    if (responseFormat === 'text-only') {
      res.json({
        success: true,
        data: {
          text: result.text
        }
      });
    } else {
      res.json({
        success: true,
        data: result
      });
    }
  } catch (error) {
    console.error('OCR route error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process document'
    });
  }
});

/**
 * @route   POST /api/ocr/extract-url
 * @desc    Extract text from URL
 * @access  Private
 */
router.post('/extract-url', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        message: 'URL is required' 
      });
    }
    
    // Get options from request
    const options = {
      language: req.body.language || 'eng',
      scale: req.body.scale !== 'false',
      isTable: req.body.isTable === 'true',
      OCREngine: req.body.engine ? parseInt(req.body.engine, 10) : 2
    };
    
    // Send to OCR service
    const result = await ocrService.extractText(url, options);
    
    // Determine if client wants full details or just text
    const responseFormat = req.query.format || 'standard';
    
    if (responseFormat === 'text-only') {
      res.json({
        success: true,
        data: {
          text: result.text
        }
      });
    } else {
      res.json({
        success: true,
        data: result
      });
    }
  } catch (error) {
    console.error('OCR URL route error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process document URL'
    });
  }
});

module.exports = router; 