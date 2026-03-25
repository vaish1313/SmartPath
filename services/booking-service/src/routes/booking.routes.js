const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAllBookings,
  getAvailableSlots,
} = require('../controllers/booking.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');
const { validate, createBookingSchema, updateBookingStatusSchema } = require('../validators/booking.validator');

const router = express.Router();

router.post('/', authMiddleware, validate(createBookingSchema), createBooking);
router.get('/my', authMiddleware, getMyBookings);
router.get('/slots', getAvailableSlots);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id/status', authMiddleware, authorizeRoles('admin', 'technician', 'pathologist'), validate(updateBookingStatusSchema), updateBookingStatus);
router.delete('/:id', authMiddleware, cancelBooking);
router.get('/', authMiddleware, authorizeRoles('admin', 'technician'), getAllBookings);

module.exports = router;
