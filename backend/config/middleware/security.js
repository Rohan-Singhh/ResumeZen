const helmet = require('helmet');
const cors = require('cors');

/**
 * Configure security middleware
 * @param {Express} app - Express application instance
 */
const configureSecurity = (app) => {
  // Apply helmet security headers
  app.use(helmet());
  
  // Configure CORS to allow requests from frontend
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Common dev ports
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));
};

module.exports = configureSecurity; 