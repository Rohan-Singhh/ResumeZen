/**
 * Middleware configuration index
 * Exports a function to configure all middleware
 */

const configureSecurity = require('./security');
const configureLogger = require('./logger');
const configureRateLimit = require('./rateLimit');
const configureBodyParsers = require('./parser');

/**
 * Configure and apply all middleware to Express app
 * @param {Express} app - Express application instance
 */
const configureMiddleware = (app) => {
  // Apply middleware in the correct order
  
  // 1. Security middleware
  configureSecurity(app);
  
  // 2. Logging middleware (to log all requests)
  configureLogger(app);
  
  // 3. Rate limiting (after logging but before parsing)
  configureRateLimit(app);
  
  // 4. Request body parsers
  configureBodyParsers(app);
};

module.exports = configureMiddleware; 