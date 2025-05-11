/**
 * Upload Service
 * 
 * Handles file uploads to Cloudinary
 */

const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');

/**
 * Upload a PDF file to Cloudinary
 * @param {Object} file - The file object (path, originalname, etc)
 * @returns {Promise<Object>} - The upload result containing URL and other properties
 */
const uploadPdf = async (file) => {
  try {
    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary credentials are missing or incomplete. Please check your .env file.');
    }
    
    // Common upload options for PDF files
    const uploadOptions = {
      resource_type: 'auto',  // Let Cloudinary detect the best resource type
      folder: 'resumes',
      use_filename: true,
      unique_filename: true,
      overwrite: true,
      access_mode: 'public',
      type: 'upload',
      format: 'pdf',
      // Add PDF pages options for better preview
      pages: true,
      // Additional options for better PDF handling
      tags: ['pdf', 'resume'],
      // Ensure we get PDF access
      accessibility_analysis: true
    };
    
    console.log('Starting PDF upload to Cloudinary with options:', uploadOptions);
    
    let result;
    
    // Handle different file input formats
    if (typeof file === 'string') {
      // If file is a string path
      console.log('Uploading from string path');
      result = await cloudinary.uploader.upload(file, uploadOptions);
    } else if (file.tempFilePath) {
      // If using express-fileupload
      console.log('Uploading from temp file path:', file.tempFilePath);
      result = await cloudinary.uploader.upload(file.tempFilePath, uploadOptions);
    } else if (file.path) {
      // If using multer
      console.log('Uploading from multer path:', file.path);
      result = await cloudinary.uploader.upload(file.path, uploadOptions);
      
      // Clean up temp file after upload
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error('Error removing temp file:', err);
      }
    } else if (file.buffer) {
      // If file is a buffer
      console.log('Uploading from buffer');
      const base64Data = file.buffer.toString('base64');
      const dataUri = `data:application/pdf;base64,${base64Data}`;
      result = await cloudinary.uploader.upload(dataUri, uploadOptions);
    } else {
      throw new Error('Invalid file format provided');
    }
    
    // Validate the upload result
    if (!result || !result.secure_url) {
      throw new Error('Cloudinary upload failed to return a secure URL');
    }
    
    // Log URL information
    console.log('Uploaded PDF file URL:', result.secure_url);
    console.log('Uploaded PDF public_id:', result.public_id);
    console.log('Uploaded PDF resource_type:', result.resource_type);
    
    // Store the full public ID (including folder) for consistent access later
    const fullPublicId = result.public_id; // This includes the 'resumes/' prefix
    
    // Get original filename and sanitize for URL
    const originalFileName = file.originalname || file.name || 'document.pdf';
    const sanitizedFileName = encodeURIComponent(originalFileName);
    
    // Create direct cloudinary URLs for PDF - we'll generate multiple formats for better compatibility
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    
    // Determine the best resource type (might be 'image' or 'raw')
    const resourceType = result.resource_type || 'image';
    
    // Generate URLs for different use cases
    
    // 1. Direct viewing URL
    const viewUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${fullPublicId}.pdf`;
    
    // 2. Download URL with attachment flag
    const downloadCloudinaryUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/fl_attachment/${fullPublicId}.pdf`;
    
    // 3. Backend proxy URL for consistent PDF access
    const downloadUrl = `/api/upload/download/${fullPublicId}.pdf`;
    
    // 4. Generated signed URL with SDK
    const signedUrl = cloudinary.url(fullPublicId, {
      resource_type: resourceType,
      type: 'upload',
      format: 'pdf',
      flags: 'attachment',
      sign_url: true, // Add signature to the URL
      secure: true // Use HTTPS
    });
    
    console.log('Generated the following URLs for PDF access:');
    console.log('- Primary URL (secure_url):', result.secure_url);
    console.log('- View URL (for browser viewing):', viewUrl);
    console.log('- Download Cloudinary URL:', downloadCloudinaryUrl);
    console.log('- Backend proxy URL:', downloadUrl);
    console.log('- Signed URL:', signedUrl);
    
    // Return structured response with consistent property names
    return {
      // Main URLs
      url: result.secure_url, // Standard Cloudinary URL
      secure_url: result.secure_url, // Keep original property too
      cloudinaryUrl: downloadCloudinaryUrl, // Direct URL for download with attachment flag
      viewUrl: viewUrl, // URL for viewing in browser
      downloadUrl: downloadUrl, // Our proxy URL (most reliable)
      signedUrl: signedUrl, // Signed URL for secure access
      
      // ID and metadata information
      publicId: fullPublicId, // Include the folder for consistent handling
      public_id: fullPublicId, // Keep original property too
      format: result.format || 'pdf',
      resourceType: resourceType,
      resource_type: result.resource_type, // Keep original property too
      
      // File information
      size: result.bytes,
      originalName: originalFileName,
      fileName: originalFileName,
      
      // Timestamps
      createdAt: result.created_at,
      created_at: result.created_at, // Keep original property too
      
      // Additional Cloudinary metadata
      assetId: result.asset_id,
      asset_id: result.asset_id, // Keep original property too
      version: result.version,
      type: result.type,
      accessMode: result.access_mode,
      access_mode: result.access_mode, // Keep original property too
      
      // Additional helper property for frontend routing
      fileUrl: downloadUrl, // Preferred URL for frontend to use
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  uploadPdf
}; 