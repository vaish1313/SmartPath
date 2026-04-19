#!/usr/bin/env node
/**
 * SmartPath — Clear database script
 * Usage: node scripts/clear-db.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function clearDatabase() {
  const uri = process.env.MONGO_URL;
  if (!uri) { 
    console.error('❌  MONGO_URL not found in .env'); 
    process.exit(1); 
  }

  console.log('🔌  Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅  Connected\n');

  const db = mongoose.connection.db;
  
  // Get all collections
  const collections = await db.listCollections().toArray();
  
  console.log('🗑️  Clearing all collections...\n');
  
  for (const collection of collections) {
    const collectionName = collection.name;
    const count = await db.collection(collectionName).countDocuments();
    
    if (count > 0) {
      await db.collection(collectionName).deleteMany({});
      console.log(`✅  Cleared ${collectionName} (${count} documents)`);
    } else {
      console.log(`⏭   ${collectionName} (already empty)`);
    }
  }

  console.log('\n✅  Database cleared successfully');
  await mongoose.disconnect();
}

clearDatabase().catch((err) => {
  console.error('❌  Clear failed:', err.message);
  process.exit(1);
});
