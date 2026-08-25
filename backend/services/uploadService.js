/**
 * Upload Service
 * 
 * Handles file uploads to Cloudinary
 */

const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

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
    
    // NOTE: no backend proxy URL here. An earlier revision advertised
    // `/api/upload/download/<id>`, but no route serves that path, so anything
    // using it got a 404.
    
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
    console.log('- Signed URL:', signedUrl);
    
    // Return structured response with consistent property names
    return {
      // Main URLs
      url: result.secure_url, // Standard Cloudinary URL
      secure_url: result.secure_url, // Keep original property too
      cloudinaryUrl: downloadCloudinaryUrl, // Direct URL for download with attachment flag
      viewUrl: viewUrl, // URL for viewing in browser
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
      fileUrl: downloadCloudinaryUrl, // Preferred URL for frontend to use
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Upload an image file to Cloudinary
 * @param {Object} file - The file object (path, originalname, etc)
 * @returns {Promise<Object>} - The upload result containing URL and other properties
 */
const uploadImage = async (file) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary credentials are missing or incomplete. Please check your .env file.');
    }
    
    const uploadOptions = {
      folder: 'avatars',
      use_filename: true,
      unique_filename: true,
      overwrite: true,
      resource_type: 'image',
    };
    
    let result;
    
    if (file.path) {
      result = await cloudinary.uploader.upload(file.path, uploadOptions);
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error('Error removing temp file:', err);
      }
    } else {
      throw new Error('Invalid file format provided for image upload');
    }
    
    if (!result || !result.secure_url) {
      throw new Error('Cloudinary upload failed to return a secure URL');
    }
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete a file from Cloudinary given its URL
 * @param {string} fileUrl - The Cloudinary URL of the file
 * @returns {Promise<boolean>} - True if deleted successfully
 */
const deleteFromCloudinary = async (fileUrl) => {
  if (!fileUrl) return false;
  
  try {
    // Typical URL: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/filename.ext
    // We need to extract 'folder/filename'
    const urlParts = fileUrl.split('/upload/');
    if (urlParts.length !== 2) return false;
    
    let pathPart = urlParts[1];
    
    // Remove version prefix if present (e.g., v1234567890/)
    if (pathPart.match(/^v\d+\//)) {
      pathPart = pathPart.replace(/^v\d+\//, '');
    }
    
    // Extract public_id (everything before the last dot)
    const publicId = pathPart.substring(0, pathPart.lastIndexOf('.'));
    
    if (!publicId) return false;
    
    console.log(`Attempting to delete Cloudinary file with public_id: ${publicId}`);
    
    // Try to delete as 'image' (default for avatars and pdfs in our setup)
    let result = await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: 'image' });
    
    // If not found, try 'raw' just in case
    if (result.result === 'not found') {
      result = await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: 'raw' });
    }
    
    console.log(`Cloudinary deletion result for ${publicId}:`, result);
    return result.result === 'ok';
  } catch (error) {
    console.error(`Error deleting ${fileUrl} from Cloudinary:`, error);
    return false;
  }
};

/**
 * Upload a PDF file from a memory buffer directly to Cloudinary
 * @param {Buffer} buffer - The file buffer in RAM
 * @param {string} originalName - Original filename
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadPdfFromBuffer = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadOptions = {
        resource_type: 'auto',
        folder: 'resumes',
        format: 'pdf',
        pages: true,
        use_filename: true,
        unique_filename: true,
        filename_override: originalName,
        access_mode: 'public',
        flags: 'attachment',
      };

      const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) {
          console.error('Cloudinary buffer upload error:', error);
          reject(error);
        } else {
          const resourceType = result.resource_type || 'image';
          const fullPublicId = result.public_id; 
          
          const cloudinaryUrl = cloudinary.url(`${fullPublicId}.pdf`, {
            resource_type: resourceType,
            type: 'upload',
            flags: 'attachment',
            secure: true
          });
          
          const cloudName = process.env.CLOUDINARY_CLOUD_NAME || cloudinary.config().cloud_name;
          const viewUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${fullPublicId}.pdf`;

          resolve({
            url: result.secure_url,
            secure_url: result.secure_url,
            cloudinaryUrl,
            viewUrl,
            publicId: fullPublicId,
            public_id: fullPublicId,
            format: result.format || 'pdf',
            resourceType,
            size: result.bytes,
            createdAt: result.created_at
          });
        }
      });
      
      Readable.from(buffer).pipe(uploadStream);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  uploadPdf,
  uploadPdfFromBuffer,
  uploadImage,
  deleteFromCloudinary
}; 