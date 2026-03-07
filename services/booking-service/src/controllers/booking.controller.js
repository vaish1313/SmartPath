const Booking = require('../models/Booking');
const Test = require('../models/Test');
const { startOfDay, endOfDay, format } = require('date-fns');

const createBooking = async (req, res) => {
  const { patientId, patientName, patientPhone, tests, bookingType, appointmentDate, appointmentSlot, address, notes, paymentMethod } = req.body;

  // Validate tests exist
  const testDocs = await Test.find({ _id: { $in: tests }, isActive: true });

  if (testDocs.length !== tests.length) {
    return res.status(400).json({
      success: false,
      message: 'One or more tests are invalid or inactive',
    });
  }

  // Calculate amounts
  const totalAmount = testDocs.reduce((sum, test) => sum + (test.discountedPrice || test.price), 0);
  let discountAmount = 0;

  // Apply 10% discount if more than 3 tests
  if (testDocs.length > 3) {
    discountAmount = totalAmount * 0.1;
  }

  const finalAmount = totalAmount - discountAmount;

  // Prepare test details
  const testDetails = testDocs.map((test) => ({
    testId: test._id,
    testName: test.name,
    testCode: test.code,
    price: test.discountedPrice || test.price,
  }));

  // Create booking
  const booking = await Booking.create({
    patientId,
    patientName,
    patientPhone,
    tests: testDetails,
    totalAmount,
    discountAmount,
    finalAmount,
    bookingType,
    appointmentDate: new Date(appointmentDate),
    appointmentSlot,
    address,
    notes,
    paymentMethod,
  });

  res.status(201).json({
    success: true,
    booking,
  });
};

const getMyBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { patientId: req.user.id };

  const [bookings, total] = await Promise.all([
    Booking.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Booking.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    bookings,
    total,
    page,
    totalPages,
  });
};

const getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  // Patient can only see their own booking
  if (req.user.role === 'patient' && booking.patientId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  res.status(200).json({
    success: true,
    booking,
  });
};

const updateBookingStatus = async (req, res) => {
  const { status } = req.body;

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  res.status(200).json({
    success: true,
    booking,
  });
};

const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  // Patient can only cancel their own booking
  if (booking.patientId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  // Can only cancel if status is pending or confirmed
  if (!['pending', 'confirmed'].includes(booking.status)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel booking in current status',
    });
  }

  booking.status = 'cancelled';
  await booking.save();

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    booking,
  });
};

const getAllBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { status, bookingType, date, patientPhone } = req.query;

  const query = {};
  if (status) query.status = status;
  if (bookingType) query.bookingType = bookingType;
  if (patientPhone) query.patientPhone = { $regex: patientPhone, $options: 'i' };
  if (date) {
    const searchDate = new Date(date);
    query.appointmentDate = {
      $gte: startOfDay(searchDate),
      $lte: endOfDay(searchDate),
    };
  }

  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    Booking.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Booking.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    bookings,
    total,
    page,
    totalPages,
  });
};

const getAvailableSlots = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Date is required',
    });
  }

  const searchDate = new Date(date);

  // Generate slots from 7 AM to 6 PM
  const slots = [];
  for (let hour = 7; hour <= 18; hour++) {
    const startHour = hour % 12 || 12;
    const endHour = (hour + 1) % 12 || 12;
    const startPeriod = hour < 12 ? 'AM' : 'PM';
    const endPeriod = (hour + 1) < 12 ? 'AM' : 'PM';
    
    const slotString = `${String(startHour).padStart(2, '0')}:00 ${startPeriod} - ${String(endHour).padStart(2, '0')}:00 ${endPeriod}`;
    slots.push(slotString);
  }

  // Get bookings for the date
  const bookings = await Booking.find({
    appointmentDate: {
      $gte: startOfDay(searchDate),
      $lte: endOfDay(searchDate),
    },
    status: { $nin: ['cancelled'] },
  });

  // Count bookings per slot
  const slotCounts = {};
  bookings.forEach((booking) => {
    slotCounts[booking.appointmentSlot] = (slotCounts[booking.appointmentSlot] || 0) + 1;
  });

  // Mark slots as available or unavailable
  const availableSlots = slots.map((slot) => ({
    slot,
    available: (slotCounts[slot] || 0) < 10,
    bookingsCount: slotCounts[slot] || 0,
  }));

  res.status(200).json({
    success: true,
    date: format(searchDate, 'yyyy-MM-dd'),
    slots: availableSlots,
  });
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAllBookings,
  getAvailableSlots,
};
