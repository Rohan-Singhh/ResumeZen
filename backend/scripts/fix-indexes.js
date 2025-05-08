require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function fixIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Get the User collection
    const userCollection = mongoose.connection.collection('users');
    
    // List current indexes
    console.log('Current indexes:');
    const indexes = await userCollection.indexes();
    console.log(JSON.stringify(indexes, null, 2));
    
    // Find and drop the problematic phone index
    for (const index of indexes) {
      if (index.key && index.key.phone === 1) {
        console.log(`Dropping problematic phone index: ${index.name}`);
        await userCollection.dropIndex(index.name);
        console.log(`Successfully dropped index: ${index.name}`);
      }
    }
    
    // Create a new non-unique index for phone if needed
    console.log('Creating new sparse index for phone field...');
    await userCollection.createIndex({ phone: 1 }, { sparse: true });
    console.log('New index created successfully');
    
    // Verify the new indexes
    console.log('New indexes:');
    const newIndexes = await userCollection.indexes();
    console.log(JSON.stringify(newIndexes, null, 2));
    
    // Check for documents with null phone
    const nullPhoneCount = await userCollection.countDocuments({ phone: null });
    console.log(`Number of documents with phone = null: ${nullPhoneCount}`);
    
    console.log('Index repair completed successfully');
  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
fixIndexes(); 