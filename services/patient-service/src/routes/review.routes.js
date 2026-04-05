const express = require('express');
const { createReview, getReviews, getReviewByBooking } = require('../controllers/review.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Public — landing page fetches this
router.get('/', getReviews);

// Protected
router.use(authMiddleware);
router.post('/', authorizeRoles('patient'), createReview);
router.get('/booking/:bookingId', getReviewByBooking);

module.exports = router;
