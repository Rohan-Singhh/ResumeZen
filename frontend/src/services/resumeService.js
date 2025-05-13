import axios from 'axios';

/**
 * Upload a resume file
 * @param {File} file - The resume file to upload
 * @returns {Promise<Object>} - Upload response with file info
 */
export const uploadResume = async (file) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await axios.post('/api/resume/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
};

/**
 * Extract text from a resume URL using OCR
 * @param {string} url - The URL of the resume file
 * @param {Object} options - OCR options
 * @returns {Promise<Object>} - OCR extraction response
 */
export const extractResumeText = async (url, options = {}) => {
  try {
    // Log the endpoint for debugging
    console.log('Making OCR request to: /api/resume/extract-text');
    console.log('With URL:', url);
    console.log('OCR options:', options);
    
    const response = await axios.post('/api/resume/extract-text', { 
      url,
      language: options.language || 'eng',
      scale: options.scale !== undefined ? options.scale : true,
      isTable: options.isTable !== undefined ? options.isTable : true,
      engine: options.engine || 2
    });
    return response.data;
  } catch (error) {
    console.error('Error extracting text from resume:', error);
    throw error;
  }
};

/**
 * Analyze a resume URL using OCR (basic statistics)
 * @param {string} url - The URL of the resume file
 * @param {Object} options - OCR options
 * @returns {Promise<Object>} - Analysis response
 */
export const analyzeResume = async (url, options = {}) => {
  try {
    // Log the endpoint for debugging
    console.log('Making analysis request to: /api/resume/analyze');
    console.log('With URL:', url);
    
    const response = await axios.post('/api/resume/analyze', { 
      url,
      language: options.language || 'eng',
      scale: options.scale !== undefined ? options.scale : true,
      isTable: options.isTable !== undefined ? options.isTable : true,
      engine: options.engine || 2
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
};

/**
 * Process resume with OCR and AI analysis
 * @param {string} url - The URL of the resume file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Complete processing response, including resumeAnalysisId if saved
 */
export const processResume = async (url, options = {}) => {
  try {
    console.log('Making process request to: /api/resume/process');
    console.log('With URL:', url);
    console.log('Process options:', {
      language: options.language || 'eng',
      scale: options.scale !== undefined ? options.scale : true,
      isTable: options.isTable !== undefined ? options.isTable : true,
      engine: options.engine || 2,
      model: options.model || 'meta-llama/llama-4-maverick:free'
    });
    
    const response = await axios.post('/api/resume/process', {
      url,
      // OCR options
      language: options.language || 'eng',
      scale: options.scale !== undefined ? options.scale : true,
      isTable: options.isTable !== undefined ? options.isTable : true,
      engine: options.engine || 2,
      // AI options
      model: options.model || 'meta-llama/llama-4-maverick:free',
      prompt: options.prompt
    });
    // Attach resumeAnalysisId if present
    const data = response.data;
    if (data && data.resumeAnalysisId) {
      data.resumeAnalysisId = response.data.resumeAnalysisId;
    }
    return data;
  } catch (error) {
    console.error('Error processing resume:', error);
    throw error;
  }
};

/**
 * Analyze resume text with AI
 * @param {string} text - The extracted resume text
 * @param {Object} options - AI analysis options
 * @returns {Promise<Object>} - AI analysis response
 */
export const analyzeResumeWithAI = async (text, options = {}) => {
  try {
    console.log('Making AI analysis request to: /api/resume/ai-analysis');
    console.log('AI model:', options.model || 'meta-llama/llama-4-maverick:free');
    
    const response = await axios.post('/api/resume/ai-analysis', {
      text,
      model: options.model || 'meta-llama/llama-4-maverick:free',
      prompt: options.prompt,
      systemPrompt: options.systemPrompt
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing resume with AI:', error);
    throw error;
  }
};

/**
 * Extract text from a document using direct OCR API
 * @param {string} url - The URL of the document
 * @param {Object} options - OCR options
 * @returns {Promise<Object>} - OCR extraction response
 */
export const extractTextWithOCR = async (url, options = {}) => {
  try {
    console.log('Making direct OCR request to: /api/ocr/extract-url');
    console.log('With URL:', url);
    
    const response = await axios.post('/api/ocr/extract-url', {
      url,
      language: options.language || 'eng',
      scale: options.scale !== undefined ? options.scale : true,
      isTable: options.isTable !== undefined ? options.isTable : true,
      engine: options.engine || 2
    }, {
      params: {
        format: options.format || 'standard' // text-only or standard
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error extracting text with OCR:', error);
    throw error;
  }
};

/**
 * Upload and extract text from a document file using OCR
 * @param {File} file - The document file to upload and process
 * @param {Object} options - OCR options
 * @returns {Promise<Object>} - OCR extraction response
 */
export const uploadAndExtractText = async (file, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    
    // Add options to form data
    if (options.language) formData.append('language', options.language);
    if (options.scale !== undefined) formData.append('scale', options.scale);
    if (options.isTable !== undefined) formData.append('isTable', options.isTable);
    if (options.engine) formData.append('engine', options.engine);
    
    const response = await axios.post('/api/ocr/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        format: options.format || 'standard' // text-only or standard
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading and extracting text:', error);
    throw error;
  }
};

/**
 * Fetch the user's resume analysis history
 * @returns {Promise<Array>} - Array of ResumeAnalysis records (may be empty)
 */
export const getResumeHistory = async () => {
  try {
    const response = await axios.get('/api/resume/history');
    if (response.data && response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching resume analysis history:', error);
    return [];
  }
}; 