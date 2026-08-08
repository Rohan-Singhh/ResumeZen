import axios from 'axios';

/**
 * Unified upload + OCR + AI analysis.
 * @param {File} file - The resume file
 * @param {Object} options - AI/OCR options
 * @returns {Promise<Object>} - The complete analysis response
 */
export const analyzeUploadResume = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('resume', file);

  if (options.language) formData.append('language', options.language);
  if (options.scale !== undefined) formData.append('scale', options.scale);
  if (options.isTable !== undefined) formData.append('isTable', options.isTable);
  if (options.engine) formData.append('engine', options.engine);
  if (options.model) formData.append('model', options.model);

  const response = await axios.post('/api/resume/analyze-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

/**
 * Fetch the user's resume analysis history.
 * @returns {Promise<Array>} - Array of ResumeAnalysis records (may be empty)
 */
export const getResumeHistory = async () => {
  const response = await axios.get('/api/resume/history');
  if (response.data?.success) {
    return response.data.data || [];
  }
  return [];
};
