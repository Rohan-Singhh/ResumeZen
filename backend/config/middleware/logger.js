const morgan = require('morgan');

/**
 * Configure request logging middleware
 * @param {Express} app - Express application instance
 */
const configureLogger = (app) => {
  // Use 'dev' format for development, 'combined' for production
  const format = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
  
  // Apply morgan logging middleware
  app.use(morgan(format));
};

module.exports = configureLogger; 