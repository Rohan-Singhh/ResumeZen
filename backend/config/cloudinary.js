/**
 * Cloudinary Configuration
 * 
 * This file configures the Cloudinary service used for file uploads
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a PDF file directly to Cloudinary
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Object>} - The upload result
 */
const uploadPDF = async (filePath) => {
  try {
    // Better options for handling PDFs
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto', // Let Cloudinary detect file type (should be 'image' for PDFs)
      folder: 'resumes',
      use_filename: true,
      unique_filename: true, 
      pages: true, // Enable PDF pages
      format: 'pdf', // Ensure PDF format
      access_type: 'authenticated', // For better handling
      type: 'upload'
    });
    
    console.log('Uploaded File URL:', result.secure_url);
    console.log('Uploaded File public_id:', result.public_id);
    console.log('Uploaded File resource_type:', result.resource_type);
    
    // Create additional direct URLs for different use cases
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    result.downloadUrl = `https://res.cloudinary.com/${cloudName}/${result.resource_type}/upload/fl_attachment/${result.public_id}.pdf`;
    result.viewUrl = `https://res.cloudinary.com/${cloudName}/${result.resource_type}/upload/${result.public_id}.pdf`;
    
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

module.exports = { 
  cloudinary,
  uploadPDF
}; 