/**
 * PDF Utilities
 * 
 * A collection of helper functions for PDF URL handling and management
 * to ensure consistent behavior across the application.
 */

/**
 * Format a backend URL for PDF download/viewing based on a publicId
 * 
 * @param {string} publicId - The Cloudinary public ID (with or without folder prefix)
 * @returns {string} - A properly formatted backend URL
 */
export const formatProxyUrl = (publicId) => {
  if (!publicId) return null;
  
  // Remove any file extension
  const formattedId = publicId.replace(/\.[^/.]+$/, '');
  
  // If publicId already has "resumes/" prefix, use it as is
  if (formattedId.startsWith('resumes/')) {
    return `/api/upload/download/${formattedId}`;
  }
  
  // Otherwise add the prefix
  return `/api/upload/download/resumes/${formattedId}`;
};

/**
 * Extract a public ID from a Cloudinary URL
 * 
 * @param {string} url - A Cloudinary URL
 * @returns {string|null} - The extracted public ID or null if not a valid Cloudinary URL
 */
export const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  if (!url.includes('cloudinary.com')) return null;
  
  try {
    // Split the URL by "/"
    const parts = url.split('/');
    
    // Find the upload segment
    const uploadIndex = parts.findIndex(part => 
      part === 'upload' || part === 'raw' || part === 'image'
    );
    
    if (uploadIndex === -1 || uploadIndex >= parts.length - 1) {
      return null;
    }
    
    // Extract segments after upload
    const publicIdParts = parts.slice(uploadIndex + 1);
    
    // Join remaining segments
    let publicId = publicIdParts.join('/');
    
    // Remove any transformations or flags if present
    if (publicId.includes('/')) {
      const lastSlashIndex = publicId.lastIndexOf('/');
      publicId = publicId.substring(lastSlashIndex + 1);
    }
    
    // Remove file extension if present
    publicId = publicId.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

/**
 * Ensure the public ID is formatted correctly for Cloudinary operations
 * 
 * @param {string} publicId - The public ID to normalize
 * @returns {string} - Properly formatted public ID
 */
export const ensureProperPublicId = (publicId) => {
  if (!publicId) return '';
  
  // Remove any file extension
  let formatted = publicId.replace(/\.[^/.]+$/, '');
  
  // Remove cloudinary URL parts if present
  if (formatted.includes('cloudinary.com')) {
    // Extract just the public ID from a full URL
    const parts = formatted.split('/upload/');
    if (parts.length > 1) {
      formatted = parts[1];
    }
  }
  
  return formatted;
};

/**
 * Generate various URL formats for a PDF based on its public ID
 * 
 * @param {string} publicId - The Cloudinary public ID
 * @param {string} [cloudName='resumezen'] - The Cloudinary cloud name
 * @returns {Object} - An object containing various URL formats
 */
export const generatePdfUrls = (publicId, cloudName = 'resumezen') => {
  if (!publicId) return {};
  
  // Ensure proper public ID format
  const formattedId = ensureProperPublicId(publicId);
  
  // Determine resource type (try both 'image' and 'raw')
  const resourceTypes = ['image', 'raw'];
  
  // Generate URLs for all resource types
  const urls = {};
  
  resourceTypes.forEach(resourceType => {
    // Direct viewing URL
    urls[`${resourceType}ViewUrl`] = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${formattedId}.pdf`;
    
    // Download URL with attachment flag
    urls[`${resourceType}DownloadUrl`] = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/fl_attachment/${formattedId}.pdf`;
  });
  
  // Backend proxy URL (most reliable for cross-browser compatibility)
  urls.proxyUrl = formatProxyUrl(formattedId);
  
  return urls;
};

/**
 * Get a browser-ready URL for PDF viewing with proper caching prevention
 * 
 * @param {string} url - The original URL
 * @param {boolean} useCache - Whether to use cache (default: false)
 * @returns {string} - URL with proper formatting for browser viewing
 */
export const getProxyUrl = (url, useCache = false) => {
  if (!url) return null;
  
  // If it's a complete URL already
  if (url.startsWith('http')) {
    // For cloudinary URLs, convert to our proxy
    if (url.includes('cloudinary.com')) {
      // Extract the public ID
      const parts = url.split('/upload/');
      if (parts.length > 1) {
        const publicId = parts[1].replace(/\.[^/.]+$/, '');
        return addCacheBuster(formatProxyUrl(publicId), useCache);
      }
    }
    // Return as is with cache buster for non-Cloudinary URLs
    return addCacheBuster(url, useCache);
  }
  
  // If it's a public ID, format it as a proxy URL
  if (url.startsWith('resumes/') || !url.startsWith('/')) {
    return addCacheBuster(formatProxyUrl(url), useCache);
  }
  
  // If it's already a backend URL, ensure it has cache busting
  if (url.startsWith('/api/upload/download')) {
    return addCacheBuster(url, useCache);
  }
  
  // For any other relative path, try to handle it
  return addCacheBuster(`/api/upload/download/${url.replace(/^\//, '')}`, useCache);
};

/**
 * Add a cache-busting parameter to a URL to prevent browser caching
 * 
 * @param {string} url - The URL to modify
 * @param {boolean} useCache - Whether to use cache (default: false)
 * @returns {string} - URL with cache-busting parameter
 */
export const addCacheBuster = (url, useCache = false) => {
  if (!url || useCache) return url;
  
  const timestamp = Date.now();
  if (url.includes('?')) {
    return `${url}&t=${timestamp}`;
  }
  return `${url}?t=${timestamp}`;
};

/**
 * Get a direct Cloudinary URL from a public ID
 * 
 * @param {string} publicId - The Cloudinary public ID
 * @param {string} [format='pdf'] - The file format
 * @returns {string} - Direct Cloudinary URL
 */
export const getDirectCloudinaryUrl = (publicId, format = 'pdf') => {
  if (!publicId) return null;
  
  // For Vite, we need to use import.meta.env instead of process.env
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'resumezen';
  const formattedId = ensureProperPublicId(publicId);
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${formattedId}.${format}`;
};

/**
 * Get a download URL with the download flag set
 * 
 * @param {string} url - The URL to convert to download URL
 * @returns {string} - URL with download parameter
 */
export const getDownloadUrl = (url) => {
  if (!url) return null;
  
  // Add download parameter
  const baseUrl = getProxyUrl(url);
  if (baseUrl.includes('?')) {
    return `${baseUrl}&download=true`;
  }
  return `${baseUrl}?download=true`;
};

/**
 * Handle PDF download based on file information
 * 
 * @param {Object} fileInfo - Object containing file information
 */
export const handlePdfDownload = (fileInfo) => {
  if (!fileInfo) return;
  
  // Determine best URL for download
  const downloadUrl = fileInfo.downloadUrl || 
                      getProxyUrl(fileInfo.publicId) || 
                      fileInfo.cloudinaryUrl || 
                      fileInfo.url;
  
  if (!downloadUrl) {
    console.error('No valid download URL found');
    return;
  }
  
  // Set the filename from stored details or a default
  const filename = fileInfo.fileName || fileInfo.originalName || 'resume.pdf';
  
  // Create a hidden anchor element
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = downloadUrl;
  a.download = filename;
  
  // Add to DOM, trigger click, then remove
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * Store PDF details in session storage in a consistent format
 * 
 * @param {Object} fileData - The file data to store
 * @param {File} [originalFile] - The original File object uploaded by the user
 */
export const storePdfDetails = (fileData, originalFile = null) => {
  if (!fileData) return;
  
  // Format URL for backend proxy if needed
  let downloadUrl = fileData.downloadUrl;
  if (!downloadUrl && fileData.publicId) {
    downloadUrl = formatProxyUrl(fileData.publicId);
  }
  
  // Create a consistent structure for resume details
  const resumeDetails = {
    // Main URLs
    url: fileData.url || fileData.secure_url,
    cloudinaryUrl: fileData.cloudinaryUrl,
    viewUrl: fileData.viewUrl,
    primaryUrl: fileData.url || fileData.secure_url,
    downloadUrl: downloadUrl,
    fallbackUrl: fileData.viewUrl || fileData.cloudinaryUrl || fileData.url,
    
    // ID information
    publicId: fileData.publicId || fileData.public_id,
    
    // File information
    fileName: originalFile?.name || fileData.originalName || fileData.fileName || 'resume.pdf',
    originalName: originalFile?.name || fileData.originalName || 'resume.pdf',
    fileSize: originalFile?.size || fileData.size || fileData.bytes,
    fileFormat: originalFile?.type || fileData.format || 'pdf',
    
    // Metadata
    format: fileData.format || 'pdf',
    resourceType: fileData.resourceType || fileData.resource_type || 'image',
    lastActivity: new Date().toISOString()
  };
  
  // Store in session storage for persistence
  sessionStorage.setItem('resumeDetails', JSON.stringify(resumeDetails));
  
  return resumeDetails;
};

/**
 * Get a fully qualified, universal URL for a PDF that will work across
 * different services and isn't affected by CORS or other restrictions
 * 
 * @param {Object} resumeFileInfo - Object containing resume file details
 * @returns {string} - A universal URL for the PDF
 */
export const getUniversalPdfUrl = (resumeFileInfo) => {
  if (!resumeFileInfo) return null;
  
  // Best universal URL is a direct Cloudinary URL
  if (resumeFileInfo.publicId) {
    // For Vite, we need to use import.meta.env instead of process.env
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'resumezen';
    // Try image format first (most common for PDFs in Cloudinary)
    return `https://res.cloudinary.com/${cloudName}/image/upload/${ensureProperPublicId(resumeFileInfo.publicId)}.pdf`;
  }
  
  // Otherwise try the cloudinary URL if available
  if (resumeFileInfo.cloudinaryUrl) {
    return resumeFileInfo.cloudinaryUrl;
  }
  
  // Otherwise fall back to any other URL
  return resumeFileInfo.url || resumeFileInfo.viewUrl || resumeFileInfo.fallbackUrl;
};

export default {
  formatProxyUrl,
  extractPublicIdFromUrl,
  ensureProperPublicId,
  generatePdfUrls,
  getProxyUrl,
  handlePdfDownload,
  storePdfDetails,
  getUniversalPdfUrl
}; 