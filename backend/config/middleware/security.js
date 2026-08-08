const helmet = require('helmet');
const cors = require('cors');

/**
 * Configure security middleware
 * @param {Express} app - Express application instance
 */
const configureSecurity = (app) => {
  // Render terminates TLS at a single proxy hop, so req.ip must come from the
  // last X-Forwarded-For entry. Without this every request looks like it comes
  // from the proxy and the whole userbase shares one rate-limit bucket.
  // Keep this a hop count, never `true` — trusting the full chain lets a client
  // spoof X-Forwarded-For and bypass the limiter entirely.
  const trustProxy = process.env.TRUST_PROXY_HOPS
    ? parseInt(process.env.TRUST_PROXY_HOPS, 10)
    : 1;
  app.set('trust proxy', trustProxy);

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