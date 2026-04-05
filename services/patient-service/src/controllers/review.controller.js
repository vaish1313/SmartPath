const Review = require('../models/Review');

// POST /api/reviews  — patient submits a review
exports.createReview = async (req, res) => {
  const { bookingId, rating, review } = req.body;
  const patientId = req.user.id;
  const patientName = req.user.fullName || req.user.name || 'Patient';

  if (!bookingId || !rating || !review) {
    return res.status(400).json({ success: false, message: 'bookingId, rating and review are required' });
  }

  const existing = await Review.findOne({ bookingId });
  if (existing) {
    return res.status(409).json({ success: false, message: 'You have already reviewed this booking' });
  }

  const created = await Review.create({ patientId, patientName, bookingId, rating, review });
  res.status(201).json({ success: true, review: created });
};

// GET /api/reviews  — public, returns approved reviews
exports.getReviews = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const reviews = await Review.find({ isApproved: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('patientName rating review createdAt');
  res.json({ success: true, reviews });
};

// GET /api/reviews/booking/:bookingId  — check if review exists for a booking
exports.getReviewByBooking = async (req, res) => {
  const review = await Review.findOne({ bookingId: req.params.bookingId });
  res.json({ success: true, review: review || null });
};
