/**
 * Configure base application routes (non-API)
 * @param {Express} app - Express application instance
 */
const configureBaseRoutes = (app) => {
  // Root route - health check
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Welcome to ResumeZen API',
      version: '1.0.0',
      status: 'operational',
      timestamp: new Date().toISOString()
    });
  });
  
  // API documentation route (can be implemented later)
  app.get('/docs', (req, res) => {
    res.json({
      message: 'API documentation',
      // This can be replaced with actual documentation later
      endpoints: [
        { path: '/api/auth/phone', method: 'POST', description: 'Phone authentication' },
        { path: '/api/auth/verify-token', method: 'POST', description: 'Verify authentication token' }
      ]
    });
  });
};

module.exports = configureBaseRoutes; 