/**
 * Script to fix MongoDB index issues with null phone values
 * 
 * Run with: node scripts/fix-user-indexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function fixUserIndexes() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Get collection info
    const collection = User.collection;
    console.log('User collection name:', collection.collectionName);
    
    // Get current indexes
    console.log('\nCurrent indexes:');
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));
    
    // Find users with null phone values
    const usersWithNullPhone = await User.find({ phone: null }).select('_id email phone').lean();
    console.log(`\nFound ${usersWithNullPhone.length} users with null phone values.`);
    
    if (usersWithNullPhone.length > 0) {
      console.log('\nUpdating users with null phone to undefined...');
      
      // Update all users with null phone to undefined phone
      const updateResult = await User.updateMany(
        { phone: null },
        { $unset: { phone: "" } }
      );
      
      console.log(`Updated ${updateResult.modifiedCount} users successfully.`);
    }
    
    // Check if phone index needs to be recreated
    const phoneIndex = indexes.find(idx => idx.key && idx.key.phone);
    if (phoneIndex && !phoneIndex.sparse) {
      console.log('\nDropping non-sparse phone index...');
      await collection.dropIndex('phone_1');
      console.log('Successfully dropped phone index.');
      
      console.log('\nCreating new sparse phone index...');
      await collection.createIndex({ phone: 1 }, { sparse: true, unique: true });
      console.log('Successfully created new sparse phone index.');
    }
    
    // Verify fix
    console.log('\nVerifying fix...');
    const verifyIndexes = await collection.indexes();
    console.log('Updated indexes:');
    console.log(JSON.stringify(verifyIndexes, null, 2));
    
    const remainingNullPhone = await User.countDocuments({ phone: null });
    console.log(`Users with null phone after fix: ${remainingNullPhone}`);
    
    console.log('\nFix complete!');
  } catch (error) {
    console.error('Error fixing user indexes:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the script
fixUserIndexes(); 