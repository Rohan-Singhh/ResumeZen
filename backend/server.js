/**
 * ResumeZen API Server
 * Main application file
 */

// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');

// Import configuration from centralized config
const config = require('./config');

// Initialize Express app
const app = express();

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

/**
 * Check critical environment variables
 */
const checkEnvironmentVariables = () => {
  const criticalVars = {
    'Cloudinary Cloud Name': process.env.CLOUDINARY_CLOUD_NAME,
    'Cloudinary API Key': process.env.CLOUDINARY_API_KEY,
    'Cloudinary API Secret': process.env.CLOUDINARY_API_SECRET,
    'JWT Secret': process.env.JWT_SECRET
  };

  const missingVars = Object.entries(criticalVars)
    .filter(([_, value]) => !value)
    .map(([name]) => name);

  if (missingVars.length > 0) {
    console.warn('⚠️  Missing critical environment variables:');
    missingVars.forEach(name => console.warn(`   - ${name}`));
    console.warn('⚠️  Check your .env file and restart the server.');
  } else {
    console.log('✅ All critical environment variables are set.');
  }
};

/**
 * Start server and initialize all components
 */
const startServer = async () => {
  try {
    // Check environment variables
    checkEnvironmentVariables();
    
    // Apply middleware
    config.middleware(app);
    
    // Connect to database
    await config.database.connect();
    
    // Set up API routes
    config.routes(app);
    
    // Configure error handling (must be last)
    config.errorHandlers(app);
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`✅ API available at http://localhost:${PORT}/`);
      console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Set up graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  config.database.disconnect()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
});

// Launch the application
startServer();

// For testing purposes
module.exports = app;