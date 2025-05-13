/**
 * OCR Service
 * Handles text extraction from images and PDF files
 */

const { ocrSpace } = require('ocr-space-api-wrapper');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Format OCR results into a clean, structured format
 * @param {Object} ocrResult - Raw OCR result from the API
 * @returns {Object} - Formatted OCR results
 */
const formatOcrResults = (ocrResult) => {
  if (!ocrResult || !ocrResult.ParsedResults || ocrResult.ParsedResults.length === 0) {
    return {
      text: '',
      metadata: {
        exitCode: ocrResult?.OCRExitCode || -1,
        processingTimeInMs: ocrResult?.ProcessingTimeInMilliseconds || 0,
        searchablePdfUrl: ocrResult?.SearchablePDFURL || null
      },
      overlay: [],
      rawResult: ocrResult
    };
  }

  // Extract text from all parsed results
  const text = ocrResult.ParsedResults
    .map(result => result.ParsedText)
    .join('\n');

  // Extract metadata
  const metadata = {
    exitCode: ocrResult.OCRExitCode,
    processingTimeInMs: ocrResult.ProcessingTimeInMilliseconds,
    ocrEngine: ocrResult.OCREngine || 2,
    isPdf: ocrResult.IsErroredOnProcessing === false,
    searchablePdfUrl: ocrResult.SearchablePDFURL || null
  };

  // Extract text overlay information (word positions, etc.)
  const overlay = [];
  if (ocrResult.ParsedResults[0]?.TextOverlay?.Lines) {
    ocrResult.ParsedResults[0].TextOverlay.Lines.forEach(line => {
      overlay.push({
        text: line.LineText,
        words: line.Words.map(word => ({
          text: word.WordText,
          position: {
            left: word.Left,
            top: word.Top,
            width: word.Width,
            height: word.Height
          }
        }))
      });
    });
  }

  return {
    text,
    metadata,
    overlay,
    rawResult: ocrResult
  };
};

/**
 * Download file from URL to temp location
 * @param {string} url - File URL
 * @returns {Promise<string>} - Path to downloaded file
 */
const downloadFile = async (url) => {
  try {
    console.log('Downloading file from URL:', url);
    
    // Download the file
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'ResumeZen OCR Service/1.0'
      }
    });
    
    // Create a temporary file to save the downloaded content
    const tempDir = os.tmpdir();
    const fileExt = url.toLowerCase().includes('pdf') ? 'pdf' : 'jpg';
    const tempFilePath = path.join(tempDir, `ocr-temp-${Date.now()}.${fileExt}`);
    
    console.log('Saving file to temporary location:', tempFilePath);
    fs.writeFileSync(tempFilePath, response.data);
    
    return tempFilePath;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error(`Failed to download file from URL: ${error.message}`);
  }
};

/**
 * Extract text from image or PDF
 * @param {string} source - URL, file path, or base64 string of the document
 * @param {Object} options - Additional OCR options
 * @returns {Promise<Object>} - OCR results
 */
const extractText = async (source, options = {}) => {
  try {
    // Set API key from environment variable, no fallback to prevent exposure
    const apiKey = process.env.OCR_SPACE_API_KEY;
    
    if (!apiKey) {
      console.error('OCR_SPACE_API_KEY environment variable is not set');
      throw new Error('OCR API key is not configured. Please set OCR_SPACE_API_KEY in environment variables.');
    }
    
    let tempFilePath = null;
    let sourceType = 'unknown';
    
    // Default options for OCR Space
    const defaultOptions = {
      apiKey,
      isCreateSearchablePdf: true,
      isSearchablePdfHideTextLayer: false,
      isTable: true,
      language: options.language || 'eng',
      OCREngine: options.OCREngine || 2, // More accurate engine
      isOverlayRequired: true,
      scale: options.scale !== false,
      ...options
    };
    
    console.log('Extracting text with options:', {
      language: defaultOptions.language,
      engine: defaultOptions.OCREngine,
      scale: defaultOptions.scale,
      isTable: defaultOptions.isTable
    });
    
    // Handle different source types
    if (source && typeof source === 'string') {
      // Handle HTTP/HTTPS URLs (including relative URLs converted to absolute)
      if (source.startsWith('http://') || source.startsWith('https://')) {
        console.log('Processing source type: URL');
        sourceType = 'url';
        tempFilePath = await downloadFile(source);
        source = tempFilePath;
      } 
      // Handle relative URLs (example: '/api/uploads/file.pdf')
      else if (source.startsWith('/api') || source.startsWith('/uploads')) {
        console.log('Processing source type: Relative URL');
        sourceType = 'relative_url';
        // Get the base URL from environment or use localhost
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
        const absoluteUrl = `${baseUrl}${source}`;
        
        tempFilePath = await downloadFile(absoluteUrl);
        source = tempFilePath;
      }
      // Handle base64 data
      else if (source.startsWith('data:')) {
        console.log('Processing source type: Base64');
        sourceType = 'base64';
        // OCR Space can handle base64 directly, no need to save to a file
      }
      // Handle local file path
      else if (fs.existsSync(source)) {
        console.log('Processing source type: File path');
        sourceType = 'file_path';
        // No need to do anything, OCR Space can handle file paths
      }
      else {
        console.log('Processing source type: Unknown string');
        sourceType = 'unknown_string';
        // Treat as plain text or file path
      }
    }
    
    // Process the source with OCR
    console.log('Processing source with OCR Space');
    const result = await ocrSpace(source, defaultOptions);
    
    // Clean up temporary file if created
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log('Cleaned up temporary file:', tempFilePath);
    }
    
    // Format and return the OCR results
    const formattedResults = formatOcrResults(result);
    
    // Add source type to metadata
    formattedResults.metadata = {
      ...formattedResults.metadata,
      sourceType
    };
    
    return formattedResults;
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error(`Failed to extract text from document: ${error.message}`);
  }
};

module.exports = {
  extractText,
  formatOcrResults
}; 