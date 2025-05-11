const rateLimit = require('express-rate-limit');

/**
 * Configure global rate limiter
 * @param {Express} app - Express application instance
 */
const configureRateLimit = (app) => {
  // Create a global rate limiter
  const limiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 300, // increase the limit to 300 requests per window
    message: {
      error: 'Too many requests from this IP, please try again after 30 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Add key generator to track by IP
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    },
    // Skip rate limiting for some low-risk endpoints
    skip: (req) => {
      // Allow unlimited access to static and public endpoints
      return req.path === '/';
    }
  });
  
  // Apply the rate limiter to all requests
  app.use(limiter);
};

// Export rate limiter configuration
module.exports = configureRateLimit; 