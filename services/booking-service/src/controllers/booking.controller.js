const Booking = require('../models/Booking');
const { startOfDay, endOfDay, format } = require('date-fns');

/* ── Create booking ── */
const createBooking = async (req, res) => {
  const {
    patientId, patientName, patientPhone,
    tests = [], packages = [],
    collectionType, collectionAddress,
    scheduledDate, scheduledTime,
    notes, paymentMethod,
  } = req.body;

  if (!tests.length && !packages.length) {
    return res.status(400).json({ success: false, message: 'Select at least one test or package' });
  }

  // Calculate total from provided test/package prices
  const testTotal = tests.reduce((s, t) => s + (t.price || 0), 0);
  const pkgTotal = packages.reduce((s, p) => s + (p.price || 0), 0);
  const totalAmount = testTotal + pkgTotal;
  const finalAmount = totalAmount;

  const booking = await Booking.create({
    patientId, patientName, patientPhone,
    tests, packages,
    totalAmount, discountAmount: 0, finalAmount,
    collectionType,
    collectionAddress: collectionType === 'home-collection' ? collectionAddress : undefined,
    scheduledDate: new Date(scheduledDate),
    scheduledTime,
    notes, paymentMethod,
  });

  res.status(201).json({ success: true, booking });
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
};
