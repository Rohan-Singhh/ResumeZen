/**
 * Configure error handling middleware
 * @param {Express} app - Express application instance
 */
const configureErrorHandlers = (app) => {
  // 404 Not Found handler - must be before other error handlers
  app.use((req, res, next) => {
    res.status(404).json({
      success: false,
      message: 'Resource not found',
      endpoint: req.originalUrl
    });
  });
  
  // Global error handler - must be last
  app.use((err, req, res, next) => {
    // Log the error for debugging
    console.error('❌ Error:', err.stack);
    
    // Set appropriate status code
    const statusCode = err.statusCode || 500;
    
    // Send error response
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Something went wrong!' : err.message,
      // Only include error details in development
      error: process.env.NODE_ENV === 'development' ? {
        stack: err.stack,
        details: err.message
      } : {}
    });
  });
};

module.exports = configureErrorHandlers; 