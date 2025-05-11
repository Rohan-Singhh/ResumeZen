const authRouter = require('../../routes/authRoutes');
const profileRouter = require('../../routes/profileRoutes');
const planRouter = require('../../routes/planRoutes');
const uploadRouter = require('../../routes/uploadRoutes');
const resumeRouter = require('../../routes/resumeRoutes');

/**
 * Configure API routes
 * @param {Express} app - Express application instance
 */
const configureApiRoutes = (app) => {
  // Apply API version prefix to all API routes
  const apiPrefix = '/api';
  
  // Mount authentication routes
  app.use(`${apiPrefix}/auth`, authRouter);
  
  // Mount profile routes
  app.use(`${apiPrefix}/profile`, profileRouter);
  
  // Mount plan routes
  app.use(`${apiPrefix}/plans`, planRouter);
  
  // Mount upload routes
  app.use(`${apiPrefix}/upload`, uploadRouter);
  
  // Mount resume parser and analysis routes
  app.use(`${apiPrefix}/resume`, resumeRouter);
  
  // Add more API routes here as they are developed
};

module.exports = configureApiRoutes; 