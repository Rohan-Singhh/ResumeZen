/**
 * Resume Parser Service
 * 
 * Handles basic PDF operations without detailed parsing
 */

const fs = require('fs');

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
        valid: true
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

module.exports = {
  parseResume
}; 