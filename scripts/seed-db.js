#!/usr/bin/env node
/**
 * SmartPath — database seed script
 * Usage: node scripts/seed-db.js
 *
 * NOTE: Uses insertMany which bypasses Mongoose pre-save hooks,
 * so passwords are hashed here manually and IDs are generated here.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── helpers ────────────────────────────────────────────────────────────────

function pad(n, len = 4) { return String(n).padStart(len, '0'); }

async function alreadySeeded(col) {
  const count = await mongoose.connection.db.collection(col).countDocuments();
  return count > 0;
}

// ─── connect ────────────────────────────────────────────────────────────────

async function main() {
  const uri = process.env.MONGO_URL;
  if (!uri) { console.error('❌  MONGO_URL not found in .env'); process.exit(1); }

  console.log('🔌  Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅  Connected\n');

  const db = mongoose.connection.db;

  // ── 1. USERS (staff + admin) stored in `patients` collection ──────────────
  if (await alreadySeeded('patients')) {
    console.log('⏭   patients       — already seeded, skipping');
  } else {
    const SALT = 10;
    const users = [
      {
        _id: new mongoose.Types.ObjectId(),
        fullName: 'Dr. Kishor Khodke',
        email: 'admin@prathamesh.com',
        password: await bcrypt.hash('Admin@123', SALT),
        role: 'admin',
        phone: '9890000001',
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new mongoose.Types.ObjectId(),
        fullName: 'Rajesh Patil',
        email: 'tech1@prathamesh.com',
        password: await bcrypt.hash('Tech@123', SALT),
        role: 'lab_technician',
        phone: '9890000002',
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new mongoose.Types.ObjectId(),
        fullName: 'Sneha Deshmukh',
        email: 'tech2@prathamesh.com',
        password: await bcrypt.hash('Tech@123', SALT),
        role: 'lab_technician',
        phone: '9890000003',
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new mongoose.Types.ObjectId(),
        fullName: 'Dr. Priya Sharma',
        email: 'path1@prathamesh.com',
        password: await bcrypt.hash('Path@123', SALT),
        role: 'pathologist',
        phone: '9890000004',
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new mongoose.Types.ObjectId(),
        fullName: 'Pooja Kulkarni',
        email: 'reception1@prathamesh.com',
        password: await bcrypt.hash('Reception@123', SALT),
        role: 'receptionist',
        phone: '9890000005',
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Sample patients (role: 'patient') — also go into patients collection
    const patientPassword = await bcrypt.hash('Patient@123', SALT);
    const patientDocs = [
      { fullName: 'Amit Sharma',     email: 'amit@gmail.com',   phone: '9800000001', gender: 'male',   dateOfBirth: new Date('1985-06-15'), bloodGroup: 'B+',  address: { city: 'Nashik', pincode: '422001' } },
      { fullName: 'Priya Joshi',     email: 'priya@gmail.com',  phone: '9800000002', gender: 'female', dateOfBirth: new Date('1992-03-22'), bloodGroup: 'O+',  address: { city: 'Nashik', pincode: '422002' } },
      { fullName: 'Rahul Patil',     email: 'rahul@gmail.com',  phone: '9800000003', gender: 'male',   dateOfBirth: new Date('1978-11-08'), bloodGroup: 'A+',  address: { city: 'Nashik', pincode: '422003' } },
      { fullName: 'Sunita Kulkarni', email: 'sunita@gmail.com', phone: '9800000004', gender: 'female', dateOfBirth: new Date('1995-07-30'), bloodGroup: 'AB+', address: { city: 'Nashik', pincode: '422001' } },
      { fullName: 'Vijay Deshmukh',  email: 'vijay@gmail.com',  phone: '9800000005', gender: 'male',   dateOfBirth: new Date('1970-01-20'), bloodGroup: 'O-',  address: { city: 'Nashik', pincode: '422005' } },
    ].map((p, i) => ({
      _id: new mongoose.Types.ObjectId(),
      ...p,
      password: patientPassword,
      role: 'patient',
      patientId: `SP-${pad(100001 + i, 6)}`,
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const allDocs = [...users, ...patientDocs];
    await db.collection('patients').insertMany(allDocs);
    console.log(`✅  patients       — ${allDocs.length} inserted (${users.length} staff + ${patientDocs.length} patients)`);
  }

  // ── 2. TESTS ──────────────────────────────────────────────────────────────
  let testIdMap = {}; // testName → _id  (used when building packages)

  if (await alreadySeeded('tests')) {
    console.log('⏭   tests          — already seeded, skipping');
    // Still build the map so packages can reference them
    const existing = await db.collection('tests').find({}, { projection: { _id: 1, testName: 1 } }).toArray();
    existing.forEach((t) => { testIdMap[t.testName] = t._id; });
  } else {
    const rawTests = [
  // Hematology (unchanged — already correct)
  { testName: 'Complete Blood Count (CBC)', category: 'hematology', sampleType: 'blood', price: 180 },
  { testName: 'Erythrocyte Sedimentation Rate (ESR)', category: 'hematology', sampleType: 'blood', price: 80 },
  { testName: 'Blood Group & Rh Factor', category: 'hematology', sampleType: 'blood', price: 80 },
  { testName: 'Peripheral Blood Smear', category: 'hematology', sampleType: 'blood', price: 150 },
  { testName: 'Platelet Count', category: 'hematology', sampleType: 'blood', price: 120 },
  { testName: 'Bleeding Time & Clotting Time', category: 'hematology', sampleType: 'blood', price: 80 },
  { testName: 'HbA1c (Glycated Hemoglobin)', category: 'hematology', sampleType: 'blood', price: 350 },
  { testName: 'Hemoglobin', category: 'hematology', sampleType: 'blood', price: 60 },

  // Biochemistry
  { testName: 'Blood Sugar Fasting', category: 'biochemistry', sampleType: 'blood', price: 60 },
  { testName: 'Blood Sugar Post Prandial', category: 'biochemistry', sampleType: 'blood', price: 60 },
  { testName: 'Random Blood Sugar', category: 'biochemistry', sampleType: 'blood', price: 60 },
  { testName: 'Lipid Profile', category: 'biochemistry', sampleType: 'blood', price: 450 },
  { testName: 'Liver Function Test (LFT)', category: 'biochemistry', sampleType: 'blood', price: 500 },
  { testName: 'Kidney Function Test (KFT)', category: 'biochemistry', sampleType: 'blood', price: 500 },
  { testName: 'Uric Acid', category: 'biochemistry', sampleType: 'blood', price: 120 },
  { testName: 'Serum Creatinine', category: 'biochemistry', sampleType: 'blood', price: 120 },
  { testName: 'Serum Calcium', category: 'biochemistry', sampleType: 'blood', price: 150 },
  { testName: 'Serum Electrolytes', category: 'biochemistry', sampleType: 'blood', price: 350 },
  { testName: 'Total Protein & Albumin', category: 'biochemistry', sampleType: 'blood', price: 200 },
  { testName: 'Bilirubin Total & Direct', category: 'biochemistry', sampleType: 'blood', price: 150 },
  { testName: 'Iron Studies (Serum Iron & TIBC)', category: 'biochemistry', sampleType: 'blood', price: 400 },

  // Thyroid
  { testName: 'TSH (Thyroid Stimulating Hormone)', category: 'other', sampleType: 'blood', price: 280 },
  { testName: 'T3 (Triiodothyronine)', category: 'other', sampleType: 'blood', price: 220 },
  { testName: 'T4 (Thyroxine)', category: 'other', sampleType: 'blood', price: 220 },
  { testName: 'Free T4 (Free Thyroxine)', category: 'other', sampleType: 'blood', price: 280 },

  // Urine
  { testName: 'Urine Routine & Microscopy', category: 'urology', sampleType: 'urine', price: 80 },
  { testName: 'Urine Culture & Sensitivity', category: 'microbiology', sampleType: 'urine', price: 400 },
  { testName: '24hr Urine Protein', category: 'urology', sampleType: 'urine', price: 200 },
  { testName: 'Urine Microalbumin', category: 'urology', sampleType: 'urine', price: 300 },
  { testName: 'Urine Pregnancy Test (UPT)', category: 'urology', sampleType: 'urine', price: 60 },

  // Infection
  { testName: 'Widal Test', category: 'immunology', sampleType: 'blood', price: 150 },
  { testName: 'C-Reactive Protein (CRP)', category: 'immunology', sampleType: 'blood', price: 220 },
  { testName: 'Rheumatoid Factor (RA)', category: 'immunology', sampleType: 'blood', price: 180 },
  { testName: 'HIV I & II', category: 'immunology', sampleType: 'blood', price: 250 },
  { testName: 'HBsAg (Hepatitis B)', category: 'immunology', sampleType: 'blood', price: 200 },
  { testName: 'Dengue NS1 Antigen', category: 'immunology', sampleType: 'blood', price: 500 },

  // Hormones
  { testName: 'Testosterone Total', category: 'other', sampleType: 'blood', price: 450 },
  { testName: 'FSH (Follicle Stimulating Hormone)', category: 'other', sampleType: 'blood', price: 350 },
  { testName: 'LH (Luteinizing Hormone)', category: 'other', sampleType: 'blood', price: 350 },
  { testName: 'Prolactin', category: 'other', sampleType: 'blood', price: 380 },
  { testName: 'Vitamin D (25-OH)', category: 'other', sampleType: 'blood', price: 750 },
  { testName: 'Vitamin B12', category: 'other', sampleType: 'blood', price: 650 },
];


    const testDocs = rawTests.map((t, i) => ({
      _id: new mongoose.Types.ObjectId(),
      testCode: `TST-${pad(1001 + i)}`,
      ...t,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.collection('tests').insertMany(testDocs);
    testDocs.forEach((t) => { testIdMap[t.testName] = t._id; });
    console.log(`✅  tests          — ${testDocs.length} inserted`);
  }

  // ── 3. PACKAGES ───────────────────────────────────────────────────────────
  if (await alreadySeeded('packages')) {
    console.log('⏭   packages       — already seeded, skipping');
  } else {
    // Helper: resolve test names → ObjectIds
    function ids(...names) {
      return names.map((n) => {
        const id = testIdMap[n];
        if (!id) throw new Error(`Test not found in map: "${n}"`);
        return id;
      });
    }

   const rawPackages = [
  {
    packageName: 'Basic Health Checkup',
    description: 'Essential tests for routine health screening',
    testNames: ['Complete Blood Count (CBC)', 'Blood Sugar Fasting', 'Urine Routine & Microscopy', 'Hemoglobin'],
    discountedPrice: 299,
  },
  {
    packageName: 'Full Body Checkup',
    description: 'Comprehensive health screening covering all major organs',
    testNames: ['Complete Blood Count (CBC)', 'Liver Function Test (LFT)', 'Kidney Function Test (KFT)', 'Lipid Profile', 'Blood Sugar Fasting', 'TSH (Thyroid Stimulating Hormone)', 'Urine Routine & Microscopy', 'HbA1c (Glycated Hemoglobin)', 'Vitamin D (25-OH)', 'Vitamin B12'],
    discountedPrice: 1999,
  },
  {
    packageName: 'Diabetes Care Package',
    description: 'Complete diabetes monitoring and management panel',
    testNames: ['Blood Sugar Fasting', 'Blood Sugar Post Prandial', 'HbA1c (Glycated Hemoglobin)', 'Kidney Function Test (KFT)', 'Urine Microalbumin', 'Lipid Profile'],
    discountedPrice: 999,
  },
  {
    packageName: 'Cardiac Care Package',
    description: 'Heart health assessment panel',
    testNames: ['Lipid Profile', 'C-Reactive Protein (CRP)', 'Complete Blood Count (CBC)', 'Blood Sugar Fasting', 'Serum Electrolytes', 'Bilirubin Total & Direct'],
    discountedPrice: 1199,
  },
  {
    packageName: "Women's Health Package",
    description: 'Complete health panel designed for women',
    testNames: ['Complete Blood Count (CBC)', 'TSH (Thyroid Stimulating Hormone)', 'Vitamin D (25-OH)', 'Vitamin B12', 'FSH (Follicle Stimulating Hormone)', 'LH (Luteinizing Hormone)', 'Prolactin', 'Urine Routine & Microscopy', 'Blood Sugar Fasting'],
    discountedPrice: 1599,
  },
  {
    packageName: 'Thyroid Package',
    description: 'Complete thyroid function assessment',
    testNames: ['TSH (Thyroid Stimulating Hormone)', 'T3 (Triiodothyronine)', 'T4 (Thyroxine)', 'Free T4 (Free Thyroxine)'],
    discountedPrice: 699,
  },
];

    // Build price lookup from tests collection
    const allTests = await db.collection('tests').find({}, { projection: { _id: 1, testName: 1, price: 1 } }).toArray();
    const priceMap = {};
    allTests.forEach((t) => {
      testIdMap[t.testName] = t._id; // refresh map in case we skipped seeding
      priceMap[t.testName] = t.price;
    });

    const pkgDocs = rawPackages.map((p, i) => {
      const testIds = ids(...p.testNames);
      const originalPrice = p.testNames.reduce((s, n) => s + (priceMap[n] || 0), 0);
      return {
        _id: new mongoose.Types.ObjectId(),
        packageCode: `PKG-${pad(1001 + i)}`,
        packageName: p.packageName,
        description: p.description,
        tests: testIds,
        originalPrice,
        discountedPrice: p.discountedPrice,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    await db.collection('packages').insertMany(pkgDocs);
    console.log(`✅  packages       — ${pkgDocs.length} inserted`);
  }

  console.log('\n✅  Database seed complete');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
