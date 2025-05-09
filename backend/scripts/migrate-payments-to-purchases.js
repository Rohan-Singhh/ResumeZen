require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

async function migratePaymentsToPurchases() {
  try {
    console.log('Starting migration from Payment to Purchase collection...');
    
    // Connect to MongoDB
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    
    // Check if Payment collection exists
    const collections = await db.listCollections().toArray();
    const paymentCollectionExists = collections.some(c => c.name === 'payments');
    
    if (!paymentCollectionExists) {
      console.log('Payment collection does not exist. Migration not needed.');
      await client.close();
      return;
    }
    
    // Check if Purchase collection already has documents
    const purchaseCount = await db.collection('purchases').countDocuments();
    if (purchaseCount > 0) {
      console.log(`Purchase collection already has ${purchaseCount} documents. Skipping migration.`);
      await client.close();
      return;
    }
    
    // Get Plan collection to map old planId to new _id
    const plans = await db.collection('plans').find().toArray();
    
    // Create a map from old planId to new _id
    const planMap = {};
    for (const plan of plans) {
      // Old plans had planId, new ones don't
      if (plan.planId) {
        planMap[plan.planId] = plan._id;
      }
    }
    
    console.log('Plan mapping:', planMap);
    
    // Get all documents from the Payment collection
    const payments = await db.collection('payments').find().toArray();
    console.log(`Found ${payments.length} payment documents to migrate.`);
    
    if (payments.length === 0) {
      console.log('No payments to migrate.');
      await client.close();
      return;
    }
    
    // Transform payments to purchases
    const purchases = payments.map(payment => {
      // Calculate remaining checks or expiration based on valid until
      let checksRemaining = null;
      let expiresAt = null;
      
      // Get the plan if it exists
      const planId = payment.planId;
      
      // Check if we have the plan in our map
      const planObjectId = planMap[planId];
      
      // For old unlimited plan, set up a duration-based purchase
      if (payment.planName && payment.planName.toLowerCase().includes('unlimited')) {
        expiresAt = payment.validUntil;
      } else {
        // For count-based plans, estimate remaining checks based on the plan name
        if (payment.planName && payment.planName.toLowerCase().includes('check')) {
          checksRemaining = payment.planName.match(/\d+/) ? parseInt(payment.planName.match(/\d+/)[0], 10) : 1;
        } else {
          // Default to 1 check
          checksRemaining = 1;
        }
      }
      
      return {
        user: payment.userId,
        plan: planObjectId || null,
        paymentStatus: payment.status === 'completed' ? 'success' : payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        paymentDetails: payment.paymentDetails || {},
        transactionId: payment.transactionId,
        activatedAt: payment.createdAt,
        expiresAt: expiresAt || payment.validUntil,
        checksRemaining: checksRemaining,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt || payment.createdAt
      };
    });
    
    // Filter out purchases without a plan (if mapping failed)
    const validPurchases = purchases.filter(p => p.plan !== null);
    
    if (validPurchases.length !== purchases.length) {
      console.log(`Warning: ${purchases.length - validPurchases.length} purchases had invalid plan references and were skipped.`);
    }
    
    // Insert transformed documents into Purchase collection
    if (validPurchases.length > 0) {
      const result = await db.collection('purchases').insertMany(validPurchases);
      console.log(`Successfully migrated ${result.insertedCount} payment documents to purchases.`);
    } else {
      console.log('No valid purchases to migrate.');
    }
    
    // Close the connection
    await client.close();
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Run the migration
migratePaymentsToPurchases(); 