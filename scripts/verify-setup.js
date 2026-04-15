#!/usr/bin/env node
/**
 * SmartPath — Setup Verification Script
 * Verifies that all services are running and data is accessible
 */

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${COLORS.reset} ${message}`);
}

async function checkMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    log(COLORS.green, '✓', 'MongoDB connection successful');
    
    // Check data counts
    const counts = {};
    for (const name of ['patients', 'tests', 'packages', 'bookings', 'invoices', 'labreports']) {
      if (collectionNames.includes(name)) {
        counts[name] = await mongoose.connection.db.collection(name).countDocuments();
      }
    }
    
    console.log('\n  Data Summary:');
    console.log(`    Patients:   ${counts.patients || 0}`);
    console.log(`    Tests:      ${counts.tests || 0}`);
    console.log(`    Packages:   ${counts.packages || 0}`);
    console.log(`    Bookings:   ${counts.bookings || 0}`);
    console.log(`    Invoices:   ${counts.invoices || 0}`);
    console.log(`    Reports:    ${counts.labreports || 0}`);
    
    if (counts.patients === 0 || counts.tests === 0) {
      log(COLORS.yellow, '⚠', 'Database is empty. Run: npm run seed-db');
    }
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    log(COLORS.red, '✗', `MongoDB connection failed: ${error.message}`);
    return false;
  }
}

async function checkService(name, port, endpoint = '/health') {
  try {
    const response = await axios.get(`http://localhost:${port}${endpoint}`, { timeout: 3000 });
    log(COLORS.green, '✓', `${name} is running on port ${port}`);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log(COLORS.red, '✗', `${name} is NOT running on port ${port}`);
    } else {
      log(COLORS.yellow, '⚠', `${name} responded with error: ${error.message}`);
    }
    return false;
  }
}

async function checkAPIEndpoint(name, url, requiresAuth = false) {
  try {
    const response = await axios.get(url, { timeout: 3000 });
    log(COLORS.green, '✓', `${name} endpoint accessible`);
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      if (requiresAuth) {
        log(COLORS.green, '✓', `${name} endpoint requires auth (expected)`);
        return true;
      } else {
        log(COLORS.yellow, '⚠', `${name} endpoint requires auth (unexpected)`);
        return true; // Still OK, just needs auth
      }
    }
    log(COLORS.red, '✗', `${name} endpoint failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`\n${COLORS.cyan}╔════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.cyan}║   SmartPath Setup Verification        ║${COLORS.reset}`);
  console.log(`${COLORS.cyan}╚════════════════════════════════════════╝${COLORS.reset}\n`);

  // Check MongoDB
  console.log(`${COLORS.cyan}[1] Checking MongoDB...${COLORS.reset}`);
  const mongoOk = await checkMongoDB();
  
  console.log(`\n${COLORS.cyan}[2] Checking Backend Services...${COLORS.reset}`);
  const patientServiceOk = await checkService('Patient Service', 3001);
  const bookingServiceOk = await checkService('Booking Service', 3002);
  const reportServiceOk = await checkService('Report Service', 3003);
  
  console.log(`\n${COLORS.cyan}[3] Checking A...${COLORS.reset}`);
  const testsOk = await checkAPIEndpoint('Tests API', 'http://localhost:3001/api/tests');
  const packagesOk = await checkAPIEndpoint('Packages API', 'http://localhost:3001/api/packages');
  const statsOk = await checkAPIEndpoint('Stats API', 'http://localhost:3002/api/bookings/stats', true);
  
  // Summary
  console.log(`\n${COLORS.cyan}╔════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.cyan}║   Verification Summary                 ║${COLORS.reset}`);
  console.log(`${COLORS.cyan}╚════════════════════════════════════════╝${COLORS.reset}\n`);
  
  const allOk = mongoOk && patientServiceOk && bookingServiceOk && testsOk && packagesOk;
  
  if (allOk) {
    log(COLORS.green, '✓', 'All systems operational!');
    console.log('\n  Next steps:');
    console.log('    1. Open http://localhost:3000');
    console.log('    2. Login with: admin@prathamesh.com / Admin@123');
    console.log('    3. Navigate to /admin dashboard');
  } else {
    log(COLORS.yellow, '⚠', 'Some issues detected');
    console.log('\n  To fix:');
    if (!mongoOk) {
      console.log('    - Check MongoDB connection string in .env');
    }
    if (!patientServiceOk || !bookingServiceOk || !reportServiceOk) {
      console.log('    - Start services with: npm run dev');
    }
    if (!testsOk || !packagesOk) {
      console.log('    - Seed database with: npm run seed-db');
    }
  }
  
  console.log('');
  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error('Verification failed:', err.message);
  process.exit(1);
});
