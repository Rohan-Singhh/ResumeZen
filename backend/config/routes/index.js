/**
 * Routes configuration index
 * Exports a function to configure all routes
 */

const configureApiRoutes = require('./api');
const configureBaseRoutes = require('./base');

/**
 * Configure all application routes
 * @param {Express} app - Express application instance
 */
const configureRoutes = (app) => {
  // Set up base routes (health check, documentation, etc.)
  configureBaseRoutes(app);
  
  // Set up API routes
  configureApiRoutes(app);
};

module.exports = configureRoutes; 