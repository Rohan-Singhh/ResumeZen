require('dotenv').config();
const PORT = process.env.PORT || 5000;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const authRouter = require('./routes/auth');
const purchasesRouter = require('./routes/purchases'); // Updated to use the renamed file

const app = express();

const limiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 300, // increase the limit to 300 requests per window
  message: {
    error: 'Too many requests from this IP, please try again after 30 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Add key generator to track by IP
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  // Skip rate limiting for some low-risk endpoints
  skip: (req) => {
    // Allow unlimited access to static and public endpoints
    return req.path.startsWith('/api/plans') || req.path === '/';
  }
});

const configureMiddleware = () => {
  app.use(helmet());
  
  // Configure CORS to allow requests from frontend
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Include both common dev ports
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));
  
  app.use(morgan('dev'));
  app.use(limiter);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
};

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Run the seed script with the existing connection
    const seedPlans = require('./scripts/seed-plans');
    await seedPlans(true); // Pass true to use existing connection
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
};

const configureRoutes = () => {
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to ResumeZen API' });
  });
  app.use('/api/auth', authRouter);
  app.use('/api/purchases', purchasesRouter);
  app.use('/api/payments', purchasesRouter); // Keep the old endpoint for backward compatibility
  app.use('/api/users', require('./routes/users'));
  app.use('/api/plans', require('./routes/plans'));
  
  // New routes for the Resume model
  app.use('/api/resumes', require('./routes/resumes'));
};

const configureErrorHandling = () => {
  app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  });
};

const startServer = () => {
  configureMiddleware();
  connectDatabase();
  configureRoutes();
  configureErrorHandling();
  
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
};

startServer();

module.exports = app;