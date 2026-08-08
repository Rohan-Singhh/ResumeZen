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
    // `req.ip` is now proxy-aware (see config/middleware/security.js), so the
    // library default keys correctly. A custom keyGenerator is not needed.
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