const bodyParser = require('body-parser');

/**
 * Configure request body parsers
 * @param {Express} app - Express application instance
 */
const configureBodyParsers = (app) => {
  // Parse JSON request bodies
  app.use(bodyParser.json());
  
  // Parse URL-encoded form data
  app.use(bodyParser.urlencoded({ extended: true }));
};

module.exports = configureBodyParsers; 