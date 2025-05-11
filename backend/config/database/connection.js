const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * @returns {Promise<mongoose.Connection>} Database connection
 */
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Connection options can be added here if needed in the future
    });
    
    console.log('✅ Connected to MongoDB');
    return mongoose.connection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // Exit process with failure in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw err;
  }
};

/**
 * Gracefully disconnect from database
 * @returns {Promise<void>}
 */
const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error disconnecting from MongoDB:', err);
    throw err;
  }
};

module.exports = {
  connect: connectDatabase,
  disconnect: disconnectDatabase
}; 