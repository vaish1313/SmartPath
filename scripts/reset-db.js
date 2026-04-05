#!/usr/bin/env node
/**
 * SmartPath — one-time database reset script
 * Usage: node scripts/reset-db.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const COLLECTIONS = [
  'users',
  'patients',
  'bookings',
  'samples',
  'results',
  'invoices',
  'tests',
  'packages',
  'reviews',
];

async function main() {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    console.error('❌  MONGO_URL not found in .env');
    process.exit(1);
  }

  console.log('🔌  Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅  Connected\n');

  const db = mongoose.connection.db;

  for (const name of COLLECTIONS) {
    const col = db.collection(name);
    const { deletedCount } = await col.deleteMany({});
    console.log(`🗑   ${name.padEnd(12)} — ${deletedCount} document(s) deleted`);
  }

  console.log('\n✅  Database reset complete');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌  Reset failed:', err.message);
  process.exit(1);
});
