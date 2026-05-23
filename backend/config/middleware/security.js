const helmet = require('helmet');
const cors = require('cors');

/**
 * Configure security middleware
 * @param {Express} app - Express application instance
 */
const configureSecurity = (app) => {
  // Apply helmet security headers
  app.use(helmet());
  
  // Parse ALLOWED_ORIGINS from env, and fallback to hardcoded list if not present
  const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://resume-zen-onpo.vercel.app',
    'https://resume-zen.vercel.app'
  ];
  
  const allowedOrigins = [...new Set([...envOrigins, ...defaultOrigins])];

  // Configure CORS to allow requests from frontend
  app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));
};

module.exports = configureSecurity; 