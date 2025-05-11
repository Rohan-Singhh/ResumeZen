/**
 * Upload Routes
 * 
 * Handles resume file uploads
 */

const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const { uploadPdf } = require('../services/uploadService');
const { uploadPDF } = require('../config/cloudinary');
const axios = require('axios');

// Middleware for handling file uploads
router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
  abortOnLimit: true
}));

/**
 * Test route for direct PDF upload
 * POST /api/upload/test-pdf
 */
router.post('/test-pdf', async (req, res) => {
  try {
    // Check for file in the request
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded. Use field name "pdf"'
      });
    }

    const file = req.files.pdf;
    
    // Validate file type (PDF only)
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed'
      });
    }

    // Use the direct uploadPDF function from cloudinary config
    const result = await uploadPDF(file.tempFilePath);

    // Return success with URL
    return res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Direct PDF upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading PDF',
      error: error.message
    });
  }
});

/**
 * Upload Resume endpoint
 * POST /api/upload/resume
 */
router.post('/resume', async (req, res) => {
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

    // Log file information for debugging
    console.log('Processing file upload:', {
      name: file.name,
      size: file.size,
      mimetype: file.mimetype,
      tempFilePath: file.tempFilePath
    });

    // Upload file to Cloudinary
    const result = await uploadPdf(file);
    
    // Log Cloudinary response
    console.log('Cloudinary upload result:', {
      url: result.url,
      secure_url: result.secure_url,
      cloudinaryUrl: result.cloudinaryUrl,
      viewUrl: result.viewUrl,
      publicId: result.publicId,
      format: result.format,
      resourceType: result.resourceType
    });

    // Create alternate download URL using our proxy
    const downloadUrl = `/api/upload/download/${result.publicId}.pdf`;
    const fallbackUrl = result.viewUrl || result.cloudinaryUrl || result.url;

    // Return success response with comprehensive file information
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.secure_url || result.url, // Primary URL
        secure_url: result.secure_url || result.url,
        cloudinaryUrl: result.cloudinaryUrl, // Direct cloudinary URL for download
        viewUrl: result.viewUrl, // URL for viewing the PDF
        fallbackUrl: fallbackUrl, // Another fallback option
        downloadUrl, // Our proxy download URL (most reliable)
        publicId: result.publicId,
        public_id: result.publicId,
        format: result.format,
        resourceType: result.resourceType,
        resource_type: result.resourceType,
        size: result.size,
        originalName: file.name,
        createdAt: result.createdAt,
        version: result.version,
        assetId: result.assetId,
        type: result.type,
        accessMode: result.accessMode,
        // Include original file details
        originalFile: {
          name: file.name,
          size: file.size,
          mimetype: file.mimetype
        }
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

/**
 * Download PDF endpoint - works as a proxy to access Cloudinary PDFs
 */
router.get('/download/:filename', async (req, res) => {
  try {
    // Enable CORS for PDF viewing in iframes
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Set caching headers to prevent browser caching issues
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    // Get the filename from the URL parameter
    const filename = req.params.filename;
    console.log('Download requested for file:', filename);
    
    // Add resumes/ prefix if needed
    let publicId = filename.replace(/\.pdf$/, '');
    if (!publicId.includes('/')) {
      publicId = `resumes/${publicId}`;
    }
    
    console.log('Using Cloudinary public ID:', publicId);
    
    await downloadFromCloudinary(publicId, req, res);
  } catch (error) {
    console.error('Error in download route:', error);
    
    // Return a proper error response with CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      message: 'Error downloading file',
      error: error.message
    });
  }
});

/**
 * Special route to handle PDFs in the resumes folder
 */
router.get('/download/resumes/:filename', async (req, res) => {
  try {
    // Enable CORS for PDF viewing in iframes
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Set caching headers to prevent browser caching issues
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    // Get the filename and prepend the resumes folder
    const filename = req.params.filename;
    const publicId = `resumes/${filename.replace(/\.pdf$/, '')}`;
    
    console.log('Resumes folder download for:', filename);
    console.log('Using Cloudinary public ID:', publicId);
    
    await downloadFromCloudinary(publicId, req, res);
  } catch (error) {
    console.error('Error in resumes download route:', error);
    
    // Return a proper error response with CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      message: 'Error downloading file',
      error: error.message
    });
  }
});

/**
 * Helper function to download a PDF from Cloudinary
 */
async function downloadFromCloudinary(publicId, req, res) {
  try {
    // Get Cloudinary details
    const { cloudinary } = require('../config/cloudinary');
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    // Log all attempts for debugging
    console.log('Attempting to download PDF with public ID:', publicId);
    
    // Try multiple resource types since Cloudinary can store PDFs as either 'image' or 'raw'
    let resourceInfo = null;
    const resourceTypes = ['image', 'raw'];
    
    // Try each resource type
    for (const resourceType of resourceTypes) {
      try {
        console.log(`Checking if resource exists as ${resourceType} type...`);
        resourceInfo = await cloudinary.api.resource(publicId, { resource_type: resourceType });
        if (resourceInfo) {
          console.log(`Found resource as ${resourceType} type:`, resourceInfo.secure_url);
          break;
        }
      } catch (err) {
        console.log(`Resource not found as ${resourceType} type:`, err.message);
      }
    }
    
    // If we found the resource, try to download it
    if (resourceInfo) {
      const resourceType = resourceInfo.resource_type;
      console.log(`Preparing download for ${resourceType} resource:`, publicId);
      
      // Set content disposition based on query parameter
      const disposition = req.query.download === 'true' ? 'attachment' : 'inline';
      const filename = publicId.split('/').pop() + '.pdf';
      
      // Try a direct fetch first (most reliable for iframe viewing)
      try {
        const directUrl = resourceInfo.secure_url;
        console.log('Trying resource secure_url directly:', directUrl);
        
        const response = await axios.get(directUrl, { 
          responseType: 'arraybuffer',
          headers: {
            'Accept': 'application/pdf'
          }
        });
        
        if (response.status === 200) {
          // Set appropriate headers for PDF viewing
          res.set('Content-Type', 'application/pdf');
          res.set('Content-Disposition', `${disposition}; filename="${filename}"`);
          res.set('X-Content-Type-Options', 'nosniff');
          
          return res.send(response.data);
        }
      } catch (directError) {
        console.log('Direct secure_url failed:', directError.message);
      }
      
      // Method 1: Try direct delivery URL with attachment flag
      try {
        const directUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${publicId}.pdf`;
        console.log('Trying direct URL:', directUrl);
        
        const response = await axios.get(directUrl, { 
          responseType: 'arraybuffer',
          headers: {
            'Accept': 'application/pdf'
          }
        });
        
        if (response.status === 200) {
          // Set appropriate headers for PDF viewing
          res.set('Content-Type', 'application/pdf');
          res.set('Content-Disposition', `${disposition}; filename="${filename}"`);
          res.set('X-Content-Type-Options', 'nosniff');
          
          return res.send(response.data);
        }
      } catch (directError) {
        console.log('Direct URL failed:', directError.message);
      }
      
      // Method 2: Try using the download URL from the Cloudinary API
      try {
        // Generate the proper download URL using Cloudinary's API
        const downloadUrl = cloudinary.url(publicId, {
          resource_type: resourceType,
          type: 'upload',
          format: 'pdf',
          secure: true // Use HTTPS
        });
        
        console.log('Trying Cloudinary SDK generated URL:', downloadUrl);
        
        const response = await axios.get(downloadUrl, { 
          responseType: 'arraybuffer',
          headers: {
            'Accept': 'application/pdf'
          }
        });
        
        if (response.status === 200) {
          // Set appropriate headers for PDF viewing
          res.set('Content-Type', 'application/pdf');
          res.set('Content-Disposition', `${disposition}; filename="${filename}"`);
          res.set('X-Content-Type-Options', 'nosniff');
          
          return res.send(response.data);
        }
      } catch (downloadError) {
        console.log('Download URL failed:', downloadError.message);
      }
    }
    
    // If all API methods failed, try direct URL access as fallback
    const possibleUrls = [
      `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.pdf`,
      `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}.pdf`,
      // Also try without the PDF extension in case it's not needed
      `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`,
      `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}`
    ];
    
    // Try each URL
    for (const url of possibleUrls) {
      try {
        console.log('Trying fallback URL:', url);
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          headers: {
            'Accept': 'application/pdf'
          }
        });
        
        if (response.status === 200) {
          const filename = publicId.split('/').pop() + '.pdf';
          const disposition = req.query.download === 'true' ? 'attachment' : 'inline';
          
          // Set appropriate headers for PDF viewing
          res.set('Content-Type', 'application/pdf');
          res.set('Content-Disposition', `${disposition}; filename="${filename}"`);
          res.set('X-Content-Type-Options', 'nosniff');
          
          // Send the PDF data
          return res.send(response.data);
        }
      } catch (urlError) {
        console.log(`URL ${url} failed:`, urlError.message);
      }
    }
    
    // If we get here, we couldn't find the PDF with any method
    console.error('Could not find PDF with any method:', { publicId, cloudName });
    
    // Return a more detailed error response
    res.set('Content-Type', 'application/json');
    return res.status(404).json({
      success: false,
      message: 'PDF could not be found or accessed',
      details: 'All download methods failed',
      publicId,
      recommendedAction: 'Please try the direct download link or upload the PDF again'
    });
  } catch (error) {
    console.error('Download from Cloudinary failed:', error);
    throw error; 
  }
}

module.exports = router; 