#!/usr/bin/env node
/**
 * SmartPath — Drop all indexes script
 * Usage: node scripts/drop-indexes.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function dropIndexes() {
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
  
  console.log('🗑️  Dropping indexes from all collections...\n');
  
  for (const collection of collections) {
    const collectionName = collection.name;
    
    try {
      const indexes = await db.collection(collectionName).indexes();
      
      // Drop all indexes except _id
      for (const index of indexes) {
        if (index.name !== '_id_') {
          await db.collection(collectionName).dropIndex(index.name);
          console.log(`✅  Dropped index "${index.name}" from ${collectionName}`);
        }
      }
    } catch (err) {
      console.log(`⏭   ${collectionName} - ${err.message}`);
    }
  }

  console.log('\n✅  Indexes dropped successfully');
  await mongoose.disconnect();
}

dropIndexes().catch((err) => {
  console.error('❌  Drop indexes failed:', err.message);
  process.exit(1);
});
