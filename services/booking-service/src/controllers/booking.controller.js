const Booking = require('../models/Booking');
const { startOfDay, endOfDay, format } = require('date-fns');
const axios = require('axios');

/* ── Auto-assign helper ── */
async function autoAssign(role) {
  try {
    const token = process.env.INTERNAL_SERVICE_TOKEN || process.env.JWT_SECRET;
    const res = await axios.get(`http://localhost:${process.env.PATIENT_SERVICE_PORT || 3001}/api/users?role=${role}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 3000,
    });
    const users = res.data?.users || [];
    if (!users.length) return null;

    // Count active bookings per user (load balancing)
    const counts = await Promise.all(
      users.map(async (u) => {
        const field = role === 'lab_technician' ? 'assignedTechnician' : 'assignedPathologist';
        const count = await Booking.countDocuments({
          [field]: String(u._id),
          status: { $in: ['pending', 'confirmed', 'sample-collected', 'processing'] },
        });
        return { id: String(u._id), count };
      })
    );

    // Pick user with fewest active bookings
    counts.sort((a, b) => a.count - b.count);
    return counts[0].id;
  } catch (err) {
    console.warn(`[autoAssign] Could not fetch ${role}s:`, err.message);
    return null;
  }
}

/* ── Create booking ── */
const createBooking = async (req, res) => {
  console.log('[createBooking] body:', JSON.stringify(req.body, null, 2));

  const {
    patientId, patientName, patientPhone,
    tests = [], packages = [],
    // accept both old and new field names
    collectionType: _collectionType, bookingType,
    collectionAddress, address,
    scheduledDate: _scheduledDate, appointmentDate,
    scheduledTime: _scheduledTime, appointmentSlot,
    notes, paymentMethod,
  } = req.body;

  const collectionType = _collectionType || bookingType;
  const scheduledDate = _scheduledDate || appointmentDate;
  const scheduledTime = _scheduledTime || appointmentSlot;
  const collectionAddress_ = collectionAddress || address;

  // Normalise tests — accept both string IDs and objects
  // If string IDs sent, look up test details from DB
  let normalisedTests = tests;
  const stringIds = tests.filter((t) => typeof t === 'string');
  if (stringIds.length > 0) {
    const Test = require('../models/Test');
    const testDocs = await Test.find({ _id: { $in: stringIds } });
    normalisedTests = stringIds.map((id) => {
      const doc = testDocs.find((d) => d._id.toString() === id);
      return doc
        ? { testId: doc._id, testName: doc.name || doc.testName, testCode: doc.code || doc.testCode, price: doc.discountedPrice || doc.price || 0 }
        : { testId: id, testName: 'Test', price: 0 };
    });
  }

  // Validate required fields explicitly so errors are clear
  if (!patientId) return res.status(400).json({ success: false, message: 'patientId is required' });
  if (!patientName) return res.status(400).json({ success: false, message: 'patientName is required' });
  if (!collectionType) return res.status(400).json({ success: false, message: 'collectionType is required (walk-in or home-collection)' });
  if (!scheduledDate) return res.status(400).json({ success: false, message: 'scheduledDate is required' });
  if (!scheduledTime) return res.status(400).json({ success: false, message: 'scheduledTime is required' });
  if (!normalisedTests.length && !packages.length) return res.status(400).json({ success: false, message: 'Select at least one test or package' });

  const parsedDate = new Date(scheduledDate);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ success: false, message: `Invalid scheduledDate: "${scheduledDate}"` });
  }

  // Calculate total from provided test/package prices
  const testTotal = normalisedTests.reduce((s, t) => s + (t.price || 0), 0);
  const pkgTotal = packages.reduce((s, p) => s + (p.price || 0), 0);
  const totalAmount = testTotal + pkgTotal;
  const finalAmount = totalAmount;

  try {
    const booking = await Booking.create({
      patientId, patientName, patientPhone,
      tests: normalisedTests, packages,
      totalAmount, discountAmount: 0, finalAmount,
      collectionType,
      collectionAddress: collectionType === 'home-collection' ? collectionAddress_ : undefined,
      scheduledDate: parsedDate,
      scheduledTime,
      notes, paymentMethod,
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error('[createBooking] Mongoose error:', err.message);
    if (err.name === 'ValidationError') {
      const fields = Object.keys(err.errors).map(k => `${k}: ${err.errors[k].message}`).join('; ');
      return res.status(400).json({ success: false, message: `Validation error — ${fields}` });
    }
    throw err; // let global error handler deal with it
  }
};

/* ── Get all bookings (staff) ── */
const getAllBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const { status, collectionType, date, search } = req.query;

  const query = {};
  if (status && status !== 'all') query.status = status;
  if (collectionType) query.collectionType = collectionType;
  if (search) {
    query.$or = [
      { patientName: { $regex: search, $options: 'i' } },
      { patientPhone: { $regex: search, $options: 'i' } },
      { bookingId: { $regex: search, $options: 'i' } },
    ];
  }
  if (date) {
    const d = new Date(date);
    query.scheduledDate = { $gte: startOfDay(d), $lte: endOfDay(d) };
  }

  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Booking.countDocuments(query),
  ]);

  res.json({ success: true, bookings, total, page, totalPages: Math.ceil(total / limit) });
};

/* ── Get bookings for a specific patient ── */
const getPatientBookings = async (req, res) => {
  const { patientId } = req.params;

  // Patients can only see their own
  if (req.user.role === 'patient' && req.user.id !== patientId) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    Booking.find({ patientId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Booking.countDocuments({ patientId }),
  ]);

  res.json({ success: true, bookings, total, page, totalPages: Math.ceil(total / limit) });
};

/* ── My bookings (patient) ── */
const getMyBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    Booking.find({ patientId: req.user.id }).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Booking.countDocuments({ patientId: req.user.id }),
  ]);

  res.json({ success: true, bookings, total, page, totalPages: Math.ceil(total / limit) });
};

/* ── Get single booking ── */
const getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  if (req.user.role === 'patient' && booking.patientId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  res.json({ success: true, booking });
};

/* ── Update status ── */
const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  res.json({ success: true, booking });
};

/* ── Assign technician ── */
const assignTechnician = async (req, res) => {
  const { technicianId } = req.body;
  const booking = await Booking.findByIdAndUpdate(req.params.id, { assignedTechnician: technicianId }, { new: true });
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  res.json({ success: true, booking });
};

/* ── Cancel booking ── */
const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  if (req.user.role === 'patient' && booking.patientId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  if (!['pending', 'confirmed'].includes(booking.status)) {
    return res.status(400).json({ success: false, message: 'Cannot cancel booking in current status' });
  }

  booking.status = 'cancelled';
  await booking.save();
  res.json({ success: true, message: 'Booking cancelled', booking });
};

/* ── Dashboard stats ── */
const getDashboardStats = async (req, res) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [totalBookings, todayBookings, pendingBookings, completedBookings, cancelledBookings, processingBookings, recentBookings] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ scheduledDate: { $gte: todayStart, $lte: todayEnd } }),
    Booking.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
    Booking.countDocuments({ status: 'completed' }),
    Booking.countDocuments({ status: 'cancelled' }),
    Booking.countDocuments({ status: { $in: ['sample-collected', 'processing'] } }),
    Booking.find().sort({ createdAt: -1 }).limit(10),
  ]);

  const Invoice = require('../models/Invoice');
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const invoices = await Invoice.find({ createdAt: { $gte: sixMonthsAgo }, paymentStatus: { $in: ['paid', 'partial'] } }).select('paidAmount createdAt');

  const monthlyRevenue = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyRevenue[format(d, 'MMM')] = 0;
  }
  invoices.forEach((inv) => {
    const key = format(new Date(inv.createdAt), 'MMM');
    if (key in monthlyRevenue) monthlyRevenue[key] += inv.paidAmount || 0;
  });

  const monthInvoices = await Invoice.find({ createdAt: { $gte: monthStart, $lte: monthEnd }, paymentStatus: { $in: ['paid', 'partial'] } }).select('paidAmount');
  const monthRevenue = monthInvoices.reduce((s, i) => s + (i.paidAmount || 0), 0);
  const monthPatients = await Booking.distinct('patientId', { createdAt: { $gte: monthStart, $lte: monthEnd } });

  const Result = require('../models/Result');
  const pendingResults = await Result.countDocuments({ approvalStatus: 'pending' });

  res.json({
    success: true,
    stats: { totalBookings, todayBookings, pendingBookings, completedBookings, cancelledBookings, processingBookings, monthRevenue, monthPatients: monthPatients.length, pendingResults },
    revenueChart: Object.entries(monthlyRevenue).map(([month, value]) => ({ month, value })),
    recentBookings,
  });
};

/* ── Available slots ── */
const getAvailableSlots = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

  const searchDate = new Date(date);
  const slots = [];

  // 7 AM – 7 PM, every 30 mins
  for (let h = 7; h < 19; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour12 = h % 12 || 12;
      const period = h < 12 ? 'AM' : 'PM';
      const mStr = m === 0 ? '00' : '30';
      slots.push(`${String(hour12).padStart(2, '0')}:${mStr} ${period}`);
    }
  }

  const bookings = await Booking.find({
    scheduledDate: { $gte: startOfDay(searchDate), $lte: endOfDay(searchDate) },
    status: { $nin: ['cancelled'] },
  });

  const slotCounts = {};
  bookings.forEach((b) => { slotCounts[b.scheduledTime] = (slotCounts[b.scheduledTime] || 0) + 1; });

  const result = slots.map((slot) => ({
    slot,
    available: (slotCounts[slot] || 0) < 10,
    count: slotCounts[slot] || 0,
  }));

  res.json({ success: true, date: format(searchDate, 'yyyy-MM-dd'), slots: result });
};

module.exports = {
  createBooking, getAllBookings, getPatientBookings, getMyBookings,
  getBookingById, updateBookingStatus, assignTechnician, cancelBooking, getAvailableSlots,
  getDashboardStats,
};
