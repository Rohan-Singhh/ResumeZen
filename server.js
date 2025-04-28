require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Temporarily commenting out MongoDB
// const mongoose = require('mongoose');
const userRoutes = require('./src/routes/userRoutes');
const resumeRoutes = require('./src/routes/resumeRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Temporarily commenting out MongoDB connection
/*
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));
*/

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ResumeZen API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 