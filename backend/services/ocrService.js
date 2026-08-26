/**
 * OCR Service
 * Handles text extraction from images and PDF files
 */

const { ocrSpace } = require('ocr-space-api-wrapper');
const axios = require('axios');
const fs = require('fs/promises');
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
        processingTimeInMs: ocrResult?.ProcessingTimeInMilliseconds || 0
      }
    };
  }

  // Extract text from all parsed results
  const text = ocrResult.ParsedResults
    .map(result => result.ParsedText)
    .join('\n');

  const metadata = {
    exitCode: ocrResult.OCRExitCode,
    processingTimeInMs: ocrResult.ProcessingTimeInMilliseconds,
    ocrEngine: ocrResult.OCREngine || 2,
    isPdf: ocrResult.IsErroredOnProcessing === false
  };

  return { text, metadata };
};

/**
 * Download a remote file to a temp path.
 *
 * Only used for the URL code path. The hot path (analyze-upload) passes the
 * buffer it already holds in memory, which avoids this round trip entirely.
 *
 * @param {string} url - File URL
 * @returns {Promise<string>} - Path to downloaded file
 */
const downloadFile = async (url) => {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: { 'User-Agent': 'ResumeZen OCR Service/1.0' }
  });

  const fileExt = url.toLowerCase().includes('pdf') ? 'pdf' : 'jpg';
  const tempFilePath = path.join(os.tmpdir(), `ocr-temp-${Date.now()}.${fileExt}`);
  await fs.writeFile(tempFilePath, response.data);

  return tempFilePath;
};

/**
 * Build the OCR Space request options.
 *
 * `isOverlayRequired` and `isCreateSearchablePdf` are deliberately off: the
 * overlay (per-word bounding boxes) and the generated searchable PDF were
 * never read downstream, but both inflate OCR processing time and response
 * size on every single analysis.
 *
 * @param {Object} options - Caller options
 * @returns {Object} - OCR Space options
 */
const buildOcrOptions = (options = {}) => {
  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) {
    throw new Error('OCR API key is not configured. Please set OCR_SPACE_API_KEY in environment variables.');
  }

  return {
    apiKey,
    language: options.language || 'eng',
    OCREngine: options.OCREngine || options.ocrEngine || options.engine || 2,
    isTable: options.isTable === true,
    scale: options.scale !== false,
    isOverlayRequired: false,
    isCreateSearchablePdf: false
  };
};

/**
 * Extract text directly from an in-memory file buffer.
 *
 * This is the fast path. Previously every analysis went
 * RAM -> Cloudinary -> download to temp disk -> upload to OCR; the buffer is
 * already here, so hand it straight to the OCR API as a data URI.
 *
 * @param {Buffer} buffer - File contents
 * @param {string} mimeType - File MIME type, e.g. 'application/pdf'
 * @param {Object} options - Additional OCR options
 * @returns {Promise<Object>} - OCR results
 */
const extractTextFromBuffer = async (buffer, mimeType = 'application/pdf', options = {}) => {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('extractTextFromBuffer requires a non-empty Buffer');
  }

  const ocrOptions = buildOcrOptions(options);
  const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

  const result = await ocrSpace(dataUri, ocrOptions);
  const formatted = formatOcrResults(result);
  formatted.metadata.sourceType = 'buffer';

  if (!formatted.text) {
    throw new Error(
      result?.ErrorMessage
        ? `OCR failed: ${[].concat(result.ErrorMessage).join('; ')}`
        : 'OCR returned no text'
    );
  }

  return formatted;
};

/**
 * Extract text from an image or PDF given a URL, file path, or base64 string.
 * @param {string} source - URL, file path, or base64 string of the document
 * @param {Object} options - Additional OCR options
 * @returns {Promise<Object>} - OCR results
 */
const extractText = async (source, options = {}) => {
  const ocrOptions = buildOcrOptions(options);

  let tempFilePath = null;
  let sourceType = 'unknown';
  let target = source;

  try {
    if (typeof source === 'string') {
      // Only fetch remote sources over TLS. Resume files come from Cloudinary
      // secure URLs (https), so plain-http remote fetching is intentionally
      // unsupported.
      if (source.startsWith('https://')) {
        sourceType = 'url';
        tempFilePath = await downloadFile(source);
        target = tempFilePath;
      } else if (source.startsWith('/api') || source.startsWith('/uploads')) {
        sourceType = 'relative_url';
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
        tempFilePath = await downloadFile(`${baseUrl}${source}`);
        target = tempFilePath;
      } else if (source.startsWith('data:')) {
        sourceType = 'base64';
      } else {
        sourceType = 'file_path';
      }
    }

    const result = await ocrSpace(target, ocrOptions);
    const formatted = formatOcrResults(result);
    formatted.metadata.sourceType = sourceType;

    if (!formatted.text) {
      throw new Error(
        result?.ErrorMessage
          ? `OCR failed: ${[].concat(result.ErrorMessage).join('; ')}`
          : 'OCR returned no text'
      );
    }

    return formatted;
  } catch (error) {
    console.error('OCR extraction failed:', error.message);
    throw new Error(`Failed to extract text from document: ${error.message}`);
  } finally {
    if (tempFilePath) {
      // Best effort — a leftover temp file must not fail the request
      await fs.unlink(tempFilePath).catch(() => {});
    }
  }
};

module.exports = {
  extractText,
  extractTextFromBuffer,
  formatOcrResults
};
