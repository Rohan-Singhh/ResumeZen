/**
 * Main configuration index
 * Central export point for all application configuration
 */

const database = require('./database');
const middleware = require('./middleware');
const routes = require('./routes');
const errorHandlers = require('./error');

module.exports = {
  database,
  middleware,
  routes,
  errorHandlers
}; 