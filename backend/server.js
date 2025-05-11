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
 * Start server and initialize all components
 */
const startServer = async () => {
  try {
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