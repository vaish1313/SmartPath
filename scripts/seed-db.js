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

    // Sample patients (role: 'patient') — 35 patients
    const patientPassword = await bcrypt.hash('Patient@123', SALT);
    const patientNames = [
      { fullName: 'Amit Sharma',     email: 'amit@gmail.com',     phone: '9800000001', gender: 'male',   dateOfBirth: new Date('1985-06-15'), bloodGroup: 'B+',  address: { city: 'Nashik', pincode: '422001' } },
      { fullName: 'Priya Joshi',     email: 'priya@gmail.com',    phone: '9800000002', gender: 'female', dateOfBirth: new Date('1992-03-22'), bloodGroup: 'O+',  address: { city: 'Nashik', pincode: '422002' } },
      { fullName: 'Rahul Patil',     email: 'rahul@gmail.com',    phone: '9800000003', gender: 'male',   dateOfBirth: new Date('1978-11-08'), bloodGroup: 'A+',  address: { city: 'Nashik', pincode: '422003' } },
      { fullName: 'Sunita Kulkarni', email: 'sunita@gmail.com',   phone: '9800000004', gender: 'female', dateOfBirth: new Date('1995-07-30'), bloodGroup: 'AB+', address: { city: 'Nashik', pincode: '422001' } },
      { fullName: 'Vijay Deshmukh',  email: 'vijay@gmail.com',    phone: '9800000005', gender: 'male',   dateOfBirth: new Date('1970-01-20'), bloodGroup: 'O-',  address: { city: 'Nashik', pincode: '422005' } },
      { fullName: 'Anjali Mehta',    email: 'anjali@gmail.com',   phone: '9800000006', gender: 'female', dateOfBirth: new Date('1988-09-12'), bloodGroup: 'A+',  address: { city: 'Nashik', pincode: '422006' } },
      { fullName: 'Karan Singh',     email: 'karan@gmail.com',    phone: '9800000007', gender: 'male',   dateOfBirth: new Date('1990-04-25'), bloodGroup: 'B-',  address: { city: 'Nashik', pincode: '422007' } },
      { fullName: 'Neha Gupta',      email: 'neha@gmail.com',     phone: '9800000008', gender: 'female', dateOfBirth: new Date('1993-12-18'), bloodGroup: 'O+',  address: { city: 'Nashik', pincode: '422008' } },
      { fullName: 'Rohan Verma',     email: 'rohan@gmail.com',    phone: '9800000009', gender: 'male',   dateOfBirth: new Date('1982-07-03'), bloodGroup: 'AB-', address: { city: 'Nashik', pincode: '422009' } },
      { fullName: 'Kavita Rao',      email: 'kavita@gmail.com',   phone: '9800000010', gender: 'female', dateOfBirth: new Date('1975-02-14'), bloodGroup: 'A-',  address: { city: 'Nashik', pincode: '422010' } },
      { fullName: 'Sanjay Pawar',    email: 'sanjay@gmail.com',   phone: '9800000011', gender: 'male',   dateOfBirth: new Date('1987-11-29'), bloodGroup: 'B+',  address: { city: 'Nashik', pincode: '422011' } },
      { fullName: 'Deepa Nair',      email: 'deepa@gmail.com',    phone: '9800000012', gender: 'female', dateOfBirth: new Date('1991-05-07'), bloodGroup: 'O-',  address: { city: 'Nashik', pincode: '422012' } },
      { fullName: 'Anil Kumar',      email: 'anil@gmail.com',     phone: '9800000013', gender: 'male',   dateOfBirth: new Date('1968-08-22'), bloodGroup: 'A+',  address: { city: 'Nashik', pincode: '422013' } },
      { fullName: 'Meera Iyer',      email: 'meera@gmail.com',    phone: '9800000014', gender: 'female', dateOfBirth: new Date('1994-01-16'), bloodGroup: 'AB+', address: { city: 'Nashik', pincode: '422014' } },
      { fullName: 'Prakash Jain',    email: 'prakash@gmail.com',  phone: '9800000015', gender: 'male',   dateOfBirth: new Date('1980-10-11'), bloodGroup: 'B-',  address: { city: 'Nashik', pincode: '422015' } },
      { fullName: 'Swati Reddy',     email: 'swati@gmail.com',    phone: '9800000016', gender: 'female', dateOfBirth: new Date('1989-06-28'), bloodGroup: 'O+',  address: { city: 'Nashik', pincode: '422016' } },
      { fullName: 'Manish Agarwal',  email: 'manish@gmail.com',   phone: '9800000017', gender: 'male',   dateOfBirth: new Date('1977-03-05'), bloodGroup: 'A-',  address: { city: 'Nashik', pincode: '422017' } },
      { fullName: 'Pooja Saxena',    email: 'pooja@gmail.com',    phone: '9800000018', gender: 'female', dateOfBirth: new Date('1996-09-19'), bloodGroup: 'AB-', address: { city: 'Nashik', pincode: '422018' } },
      { fullName: 'Rajesh Bhatt',    email: 'rajesh@gmail.com',   phone: '9800000019', gender: 'male',   dateOfBirth: new Date('1973-12-02'), bloodGroup: 'B+',  address: { city: 'Nashik', pincode: '422019' } },
      { fullName: 'Shruti Kapoor',   email: 'shruti@gmail.com',   phone: '9800000020', gender: 'female', dateOfBirth: new Date('1998-04-13'), bloodGroup: 'O-',  address: { city: 'Nashik', pincode: '422020' } },
      { fullName: 'Nitin Malhotra',  email: 'nitin@gmail.com',    phone: '9800000021', gender: 'male',   dateOfBirth: new Date('1984-07-24'), bloodGroup: 'A+',  address: { city: 'Nashik', pincode: '422021' } },
      { fullName: 'Ritu Chopra',     email: 'ritu@gmail.com',     phone: '9800000022', gender: 'female', dateOfBirth: new Date('1990-11-08'), bloodGroup: 'AB+', address: { city: 'Nashik', pincode: '422022' } },
      { fullName: 'Suresh Pillai',   email: 'suresh@gmail.com',   phone: '9800000023', gender: 'male',   dateOfBirth: new Date('1965-02-17'), bloodGroup: 'B-',  address: { city: 'Nashik', pincode: '422023' } },
      { fullName: 'Divya Menon',     email: 'divya@gmail.com',    phone: '9800000024', gender: 'female', dateOfBirth: new Date('1997-08-30'), bloodGroup: 'O+',  address: { city: 'Nashik', pincode: '422024' } },
      { fullName: 'Ashok Tiwari',    email: 'ashok@gmail.com',    phone: '9800000025', gender: 'male',   dateOfBirth: new Date('1979-05-21'), bloodGroup: 'A-',  address: { city: 'Nashik', pincode: '422025' } },
      { fullName: 'Lakshmi Bhat',    email: 'lakshmi@gmail.com',  phone: '9800000026', gender: 'female', dateOfBirth: new Date('1986-01-09'), bloodGroup: 'AB-', address: { city: 'Nashik', pincode: '422026' } },
      { fullName: 'Gaurav Sinha',    email: 'gaurav@gmail.com',   phone: '9800000027', gender: 'male',   dateOfBirth: new Date('1992-10-15'), bloodGroup: 'B+',  address: { city: 'Nashik', pincode: '422027' } },
      { fullName: 'Aarti Pandey',    email: 'aarti@gmail.com',    phone: '9800000028', gender: 'female', dateOfBirth: new Date('1983-06-04'), bloodGroup: 'O-',  address: { city: 'Nashik', pincode: '422028' } },
      { fullName: 'Vishal Dubey',    email: 'vishal@gmail.com',   phone: '9800000029', gender: 'male',   dateOfBirth: new Date('1976-03-27'), bloodGroup: 'A+',  address: { city: 'Nashik', pincode: '422029' } },
      { fullName: 'Nisha Bansal',    email: 'nisha@gmail.com',    phone: '9800000030', gender: 'female', dateOfBirth: new Date('1999-12-11'), bloodGroup: 'AB+', address: { city: 'Nashik', pincode: '422030' } },
      { fullName: 'Harish Yadav',    email: 'harish@gmail.com',   phone: '9800000031', gender: 'male',   dateOfBirth: new Date('1981-09-06'), bloodGroup: 'B-',  address: { city: 'Nashik', pincode: '422031' } },
      { fullName: 'Rekha Mishra',    email: 'rekha@gmail.com',    phone: '9800000032', gender: 'female', dateOfBirth: new Date('1988-04-18'), bloodGroup: 'O+',  address: { city: 'Nashik', pincode: '422032' } },
      { fullName: 'Sandeep Rawat',   email: 'sandeep@gmail.com',  phone: '9800000033', gender: 'male',   dateOfBirth: new Date('1974-11-23'), bloodGroup: 'A-',  address: { city: 'Nashik', pincode: '422033' } },
      { fullName: 'Madhuri Joshi',   email: 'madhuri@gmail.com',  phone: '9800000034', gender: 'female', dateOfBirth: new Date('1995-07-01'), bloodGroup: 'AB-', address: { city: 'Nashik', pincode: '422034' } },
      { fullName: 'Ramesh Kadam',    email: 'ramesh@gmail.com',   phone: '9800000035', gender: 'male',   dateOfBirth: new Date('1969-02-08'), bloodGroup: 'B+',  address: { city: 'Nashik', pincode: '422035' } },
    ];

    const patientDocs = patientNames.map((p, i) => ({
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
  { testName: 'Complete Blood Count (CBC)', category: 'hematology', sampleType: 'blood', price: 180, turnaroundTime: 6 },
  { testName: 'Erythrocyte Sedimentation Rate (ESR)', category: 'hematology', sampleType: 'blood', price: 80, turnaroundTime: 2 },
  { testName: 'Blood Group & Rh Factor', category: 'hematology', sampleType: 'blood', price: 80, turnaroundTime: 1 },
  { testName: 'Peripheral Blood Smear', category: 'hematology', sampleType: 'blood', price: 150, turnaroundTime: 12 },
  { testName: 'Platelet Count', category: 'hematology', sampleType: 'blood', price: 120, turnaroundTime: 4 },
  { testName: 'Bleeding Time & Clotting Time', category: 'hematology', sampleType: 'blood', price: 80, turnaroundTime: 1 },
  { testName: 'HbA1c (Glycated Hemoglobin)', category: 'hematology', sampleType: 'blood', price: 350, turnaroundTime: 24 },
  { testName: 'Hemoglobin', category: 'hematology', sampleType: 'blood', price: 60, turnaroundTime: 1 },

  // Biochemistry
  { testName: 'Blood Sugar Fasting', category: 'biochemistry', sampleType: 'blood', price: 60, turnaroundTime: 2 },
  { testName: 'Blood Sugar Post Prandial', category: 'biochemistry', sampleType: 'blood', price: 60, turnaroundTime: 2 },
  { testName: 'Random Blood Sugar', category: 'biochemistry', sampleType: 'blood', price: 60, turnaroundTime: 1 },
  { testName: 'Lipid Profile', category: 'biochemistry', sampleType: 'blood', price: 450, turnaroundTime: 12 },
  { testName: 'Liver Function Test (LFT)', category: 'biochemistry', sampleType: 'blood', price: 500, turnaroundTime: 12 },
  { testName: 'Kidney Function Test (KFT)', category: 'biochemistry', sampleType: 'blood', price: 500, turnaroundTime: 12 },
  { testName: 'Uric Acid', category: 'biochemistry', sampleType: 'blood', price: 120, turnaroundTime: 6 },
  { testName: 'Serum Creatinine', category: 'biochemistry', sampleType: 'blood', price: 120, turnaroundTime: 6 },
  { testName: 'Serum Calcium', category: 'biochemistry', sampleType: 'blood', price: 150, turnaroundTime: 6 },
  { testName: 'Serum Electrolytes', category: 'biochemistry', sampleType: 'blood', price: 350, turnaroundTime: 8 },
  { testName: 'Total Protein & Albumin', category: 'biochemistry', sampleType: 'blood', price: 200, turnaroundTime: 8 },
  { testName: 'Bilirubin Total & Direct', category: 'biochemistry', sampleType: 'blood', price: 150, turnaroundTime: 6 },
  { testName: 'Iron Studies (Serum Iron & TIBC)', category: 'biochemistry', sampleType: 'blood', price: 400, turnaroundTime: 12 },

  // Thyroid
  { testName: 'TSH (Thyroid Stimulating Hormone)', category: 'other', sampleType: 'blood', price: 280, turnaroundTime: 24 },
  { testName: 'T3 (Triiodothyronine)', category: 'other', sampleType: 'blood', price: 220, turnaroundTime: 24 },
  { testName: 'T4 (Thyroxine)', category: 'other', sampleType: 'blood', price: 220, turnaroundTime: 24 },
  { testName: 'Free T4 (Free Thyroxine)', category: 'other', sampleType: 'blood', price: 280, turnaroundTime: 24 },

  // Urine
  { testName: 'Urine Routine & Microscopy', category: 'urology', sampleType: 'urine', price: 80, turnaroundTime: 4 },
  { testName: 'Urine Culture & Sensitivity', category: 'microbiology', sampleType: 'urine', price: 400, turnaroundTime: 48 },
  { testName: '24hr Urine Protein', category: 'urology', sampleType: 'urine', price: 200, turnaroundTime: 24 },
  { testName: 'Urine Microalbumin', category: 'urology', sampleType: 'urine', price: 300, turnaroundTime: 12 },
  { testName: 'Urine Pregnancy Test (UPT)', category: 'urology', sampleType: 'urine', price: 60, turnaroundTime: 1 },

  // Infection
  { testName: 'Widal Test', category: 'immunology', sampleType: 'blood', price: 150, turnaroundTime: 6 },
  { testName: 'C-Reactive Protein (CRP)', category: 'immunology', sampleType: 'blood', price: 220, turnaroundTime: 8 },
  { testName: 'Rheumatoid Factor (RA)', category: 'immunology', sampleType: 'blood', price: 180, turnaroundTime: 8 },
  { testName: 'HIV I & II', category: 'immunology', sampleType: 'blood', price: 250, turnaroundTime: 24 },
  { testName: 'HBsAg (Hepatitis B)', category: 'immunology', sampleType: 'blood', price: 200, turnaroundTime: 12 },
  { testName: 'Dengue NS1 Antigen', category: 'immunology', sampleType: 'blood', price: 500, turnaroundTime: 6 },

  // Hormones
  { testName: 'Testosterone Total', category: 'other', sampleType: 'blood', price: 450, turnaroundTime: 24 },
  { testName: 'FSH (Follicle Stimulating Hormone)', category: 'other', sampleType: 'blood', price: 350, turnaroundTime: 24 },
  { testName: 'LH (Luteinizing Hormone)', category: 'other', sampleType: 'blood', price: 350, turnaroundTime: 24 },
  { testName: 'Prolactin', category: 'other', sampleType: 'blood', price: 380, turnaroundTime: 24 },
  { testName: 'Vitamin D (25-OH)', category: 'other', sampleType: 'blood', price: 750, turnaroundTime: 48 },
  { testName: 'Vitamin B12', category: 'other', sampleType: 'blood', price: 650, turnaroundTime: 48 },
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

  // ── 4. BOOKINGS ───────────────────────────────────────────────────────────
  let bookingIds = []; // Store for reports generation

  if (await alreadySeeded('bookings')) {
    console.log('⏭   bookings       — already seeded, skipping');
    // Get existing bookings for reports
    const existing = await db.collection('bookings').find({}, { projection: { _id: 1 } }).toArray();
    bookingIds = existing.map(b => b._id);
  } else {
    // Get patient IDs
    const patients = await db.collection('patients').find({ role: 'patient' }, { projection: { _id: 1, patientId: 1, fullName: 1, phone: 1 } }).toArray();
    
    // Get test and package IDs
    const tests = await db.collection('tests').find({}, { projection: { _id: 1, testName: 1, testCode: 1, price: 1 } }).toArray();
    const packages = await db.collection('packages').find({}, { projection: { _id: 1, packageName: 1, discountedPrice: 1, tests: 1 } }).toArray();

    const statuses = ['pending', 'confirmed', 'sample-collected', 'completed', 'cancelled'];
    const collectionTypes = ['walk-in', 'home-collection'];
    const timeSlots = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00'];
    
    // Create 12 bookings with varied dates over last 6 months
    const bookingDocs = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const patient = patients[i % patients.length];
      const isPackage = i % 3 === 0; // Every 3rd booking is a package
      
      // Create bookings with more recent dates to show stats
      // Bookings 0-1: Today
      // Bookings 2-5: This month (1-25 days ago)
      // Bookings 6-8: Last month
      // Bookings 9-11: 2-5 months ago
      let daysAgo;
      if (i < 2) {
        // Today (2 bookings)
        daysAgo = 0;
      } else if (i < 6) {
        // This month: 1-25 days ago (4 bookings)
        daysAgo = 1 + Math.floor(Math.random() * 25);
      } else if (i < 9) {
        // Last month: 30-55 days ago (3 bookings)
        daysAgo = 30 + Math.floor(Math.random() * 26);
      } else {
        // 2-5 months ago: 60-150 days ago (3 bookings)
        daysAgo = 60 + Math.floor(Math.random() * 91);
      }
      
      const bookingDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      // For today's bookings, schedule them for today; for others, next day
      const scheduledDate = i < 2 ? new Date(now) : new Date(bookingDate.getTime() + 1 * 24 * 60 * 60 * 1000);
      
      let totalAmount = 0;
      let testsArray = [];
      let packagesArray = [];

      if (isPackage) {
        const pkg = packages[i % packages.length];
        packagesArray.push({
          packageId: pkg._id,
          packageName: pkg.packageName,
          price: pkg.discountedPrice,
        });
        totalAmount = pkg.discountedPrice;
      } else {
        // Random 1-3 tests
        const numTests = 1 + Math.floor(Math.random() * 3);
        for (let j = 0; j < numTests; j++) {
          const test = tests[(i + j) % tests.length];
          testsArray.push({
            testId: test._id,
            testName: test.testName,
            testCode: test.testCode,
            price: test.price,
          });
          totalAmount += test.price;
        }
      }

      const discountAmount = Math.floor(totalAmount * 0.05); // 5% discount
      const finalAmount = totalAmount - discountAmount;
      const status = statuses[Math.min(Math.floor(i / 3), 3)]; // Progress through statuses
      const collectionType = collectionTypes[i % 2];

      let bookingData = {
        _id: new mongoose.Types.ObjectId(),
        bookingId: `BK-${pad(100001 + i, 6)}`,
        patientId: patient._id.toString(),
        patientName: patient.fullName,
        patientPhone: patient.phone,
        tests: testsArray,
        packages: packagesArray,
        totalAmount,
        discountAmount,
        finalAmount,
        collectionType,
        scheduledDate,
        scheduledTime: timeSlots[i % timeSlots.length],
        status,
        paymentStatus: status === 'cancelled' ? 'unpaid' : (status === 'pending' ? 'unpaid' : 'paid'),
        paymentMethod: status !== 'cancelled' && status !== 'pending' ? ['cash', 'online'][i % 2] : undefined,
        createdAt: bookingDate,
        updatedAt: bookingDate,
      };

      if (collectionType === 'home-collection') {
        bookingData.collectionAddress = {
          street: 'Sample Street',
          city: 'Nashik',
          state: 'Maharashtra',
          pincode: '422001',
        };
      }

      bookingDocs.push(bookingData);
      bookingIds.push(bookingData._id);
    }

    await db.collection('bookings').insertMany(bookingDocs);
    console.log(`✅  bookings       — ${bookingDocs.length} inserted`);
  }

  // ── 5. INVOICES (PAYMENTS) ───────────────────────────────────────────────
  if (await alreadySeeded('invoices')) {
    console.log('⏭   invoices       — already seeded, skipping');
  } else {
    // Get all bookings
    const bookings = await db.collection('bookings').find({}).toArray();
    
    const paymentMethods = ['cash', 'card', 'upi', 'online'];
    
    const invoiceDocs = bookings.map((booking, i) => {
      const isPaid = booking.paymentStatus === 'paid';
      const isPartial = booking.paymentStatus === 'partial';
      
      // Build items array from tests and packages
      const items = [];
      
      if (booking.tests && booking.tests.length > 0) {
        booking.tests.forEach(test => {
          items.push({
            description: test.testName,
            quantity: 1,
            unitPrice: test.price,
            totalPrice: test.price,
          });
        });
      }
      
      if (booking.packages && booking.packages.length > 0) {
        booking.packages.forEach(pkg => {
          items.push({
            description: pkg.packageName,
            quantity: 1,
            unitPrice: pkg.price,
            totalPrice: pkg.price,
          });
        });
      }

      const subtotal = booking.totalAmount;
      const gstAmount = Math.floor(subtotal * 0.18); // 18% GST
      const totalWithGst = subtotal + gstAmount;
      const finalAmount = booking.finalAmount;
      
      const invoice = {
        _id: new mongoose.Types.ObjectId(),
        invoiceId: `INV-${pad(100001 + i, 6)}`,
        bookingId: booking._id,
        patientId: booking.patientId,
        patientName: booking.patientName,
        patientPhone: booking.patientPhone,
        items,
        subtotal,
        gstRate: 18,
        gstAmount,
        totalAmount: totalWithGst,
        finalAmount,
        paymentStatus: booking.paymentStatus,
        paidAmount: isPaid ? finalAmount : (isPartial ? Math.floor(finalAmount * 0.5) : 0),
        balanceAmount: isPaid ? 0 : (isPartial ? Math.ceil(finalAmount * 0.5) : finalAmount),
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      };

      // Add payment record if paid
      if (isPaid) {
        invoice.payments = [{
          amount: finalAmount,
          method: paymentMethods[i % paymentMethods.length],
          transactionId: `TXN${Date.now()}${i}`,
          paidAt: booking.createdAt,
        }];
        invoice.paymentMethod = paymentMethods[i % paymentMethods.length];
        invoice.paidAt = booking.createdAt;
      }

      return invoice;
    });

    await db.collection('invoices').insertMany(invoiceDocs);
    console.log(`✅  invoices       — ${invoiceDocs.length} inserted`);
  }

  // ── 6. LAB REPORTS ────────────────────────────────────────────────────────
  if (await alreadySeeded('labreports')) {
    console.log('⏭   labreports     — already seeded, skipping');
  } else {
    // Get completed bookings for report generation
    const completedBookings = await db.collection('bookings')
      .find({ status: { $in: ['sample-collected', 'completed'] } })
      .limit(6)
      .toArray();

    if (completedBookings.length === 0) {
      console.log('⏭   labreports     — no completed bookings, skipping');
    } else {
      const reportDocs = [];
      
      for (let i = 0; i < completedBookings.length; i++) {
        const booking = completedBookings[i];
        
        // Sample test results
        const sampleTests = [
          { testName: 'Hemoglobin', testCode: 'TST-1008', value: '13.5', unit: 'g/dL', referenceRange: '12-16', flag: 'normal', method: 'Automated Analyzer' },
          { testName: 'WBC Count', testCode: 'TST-1001', value: '8500', unit: 'cells/μL', referenceRange: '4000-11000', flag: 'normal', method: 'Flow Cytometry' },
          { testName: 'Blood Sugar Fasting', testCode: 'TST-1009', value: '105', unit: 'mg/dL', referenceRange: '70-100', flag: 'high', method: 'Enzymatic' },
          { testName: 'Cholesterol Total', testCode: 'TST-1012', value: '220', unit: 'mg/dL', referenceRange: '<200', flag: 'high', method: 'Enzymatic' },
        ];

        const reportDate = new Date(booking.bookingDate || booking.createdAt);
        reportDate.setDate(reportDate.getDate() + 2); // 2 days after booking
        
        reportDocs.push({
          _id: new mongoose.Types.ObjectId(),
          patientId: booking.patientId,
          bookingId: booking._id.toString(),
          reportDate,
          generatedAt: reportDate,
          doctorName: 'Dr. Priya Sharma',
          labTechnicianId: 'tech1@prathamesh.com',
          tests: sampleTests,
          status: 'finalized',
          pdfPath: `/generated/RPT-${pad(4001 + i, 6)}.pdf`,
          createdAt: reportDate,
          updatedAt: reportDate,
        });
      }

      await db.collection('labreports').insertMany(reportDocs);
      console.log(`✅  labreports     — ${reportDocs.length} inserted`);
    }
  }

  // ── 7. SAMPLES ────────────────────────────────────────────────────────────
  if (await alreadySeeded('samples')) {
    console.log('⏭   samples        — already seeded, skipping');
  } else {
    // Get bookings with status 'confirmed' or 'sample-collected'
    const bookingsForSamples = await db.collection('bookings')
      .find({ status: { $in: ['confirmed', 'sample-collected', 'processing', 'completed'] } })
      .limit(8)
      .toArray();

    if (bookingsForSamples.length === 0) {
      console.log('⏭   samples        — no eligible bookings, skipping');
    } else {
      const sampleDocs = [];
      const statuses = ['collected', 'processing', 'completed', 'pending'];
      
      for (let i = 0; i < bookingsForSamples.length; i++) {
        const booking = bookingsForSamples[i];
        const collectedDate = new Date(booking.createdAt);
        collectedDate.setHours(collectedDate.getHours() + 2); // 2 hours after booking
        
        sampleDocs.push({
          _id: new mongoose.Types.ObjectId(),
          sampleId: `SMP-${pad(100001 + i, 6)}`,
          bookingId: booking._id,
          patientId: booking.patientId,
          patientName: booking.patientName,
          barcode: `BC${Date.now()}${1000 + i}`,
          collectedBy: 'tech1@prathamesh.com',
          collectedAt: collectedDate,
          status: statuses[i % statuses.length],
          createdAt: collectedDate,
          updatedAt: collectedDate,
        });
      }

      await db.collection('samples').insertMany(sampleDocs);
      console.log(`✅  samples        — ${sampleDocs.length} inserted`);
    }
  }

  // ── 8. RESULTS ────────────────────────────────────────────────────────────
  if (await alreadySeeded('results')) {
    console.log('⏭   results        — already seeded, skipping');
  } else {
    // Get samples with status 'completed' or 'processing'
    const samplesForResults = await db.collection('samples')
      .find({ status: { $in: ['processing', 'completed'] } })
      .limit(6)
      .toArray();

    if (samplesForResults.length === 0) {
      console.log('⏭   results        — no eligible samples, skipping');
    } else {
      const resultDocs = [];
      const approvalStatuses = ['approved', 'pending', 'approved', 'approved', 'pending', 'approved'];
      
      for (let i = 0; i < samplesForResults.length; i++) {
        const sample = samplesForResults[i];
        const booking = await db.collection('bookings').findOne({ _id: sample.bookingId });
        
        // Sample test results
        const testResults = [
          { testName: 'Hemoglobin', value: '13.5', unit: 'g/dL', normalRange: { male: '13-17', female: '12-15' }, status: 'normal' },
          { testName: 'WBC Count', value: '8500', unit: 'cells/μL', normalRange: { male: '4000-11000', female: '4000-11000' }, status: 'normal' },
          { testName: 'Blood Sugar Fasting', value: i % 2 === 0 ? '105' : '92', unit: 'mg/dL', normalRange: { male: '70-100', female: '70-100' }, status: i % 2 === 0 ? 'abnormal' : 'normal' },
        ];

        const resultDate = new Date(sample.collectedAt);
        resultDate.setHours(resultDate.getHours() + 4); // 4 hours after sample collection
        
        resultDocs.push({
          _id: new mongoose.Types.ObjectId(),
          resultId: `RES-${pad(100001 + i, 6)}`,
          bookingId: booking._id,
          sampleId: sample._id,
          patientId: sample.patientId,
          patientName: sample.patientName,
          tests: testResults,
          enteredBy: 'tech1@prathamesh.com',
          reviewedBy: approvalStatuses[i] === 'approved' ? 'path1@prathamesh.com' : undefined,
          approvalStatus: approvalStatuses[i],
          createdAt: resultDate,
          updatedAt: resultDate,
        });
      }

      await db.collection('results').insertMany(resultDocs);
      console.log(`✅  results        — ${resultDocs.length} inserted`);
    }
  }

  console.log('\n✅  Database seed complete');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
