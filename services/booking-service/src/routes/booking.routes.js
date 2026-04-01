const express = require('express');
const {
  createBooking, getAllBookings, getPatientBookings, getMyBookings,
  getBookingById, updateBookingStatus, assignTechnician, cancelBooking, getAvailableSlots,
} = require('../controllers/booking.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Public slot check (no auth needed for date picker)
router.get('/slots', getAvailableSlots);

// All other routes require auth
router.use(authMiddleware);

router.post('/', authorizeRoles('admin', 'receptionist', 'patient'), createBooking);
router.get('/', authorizeRoles('admin', 'receptionist', 'technician', 'pathologist'), getAllBookings);
router.get('/my', getMyBookings);
router.get('/patient/:patientId', getPatientBookings);
router.get('/:id', getBookingById);
router.put('/:id/status', authorizeRoles('admin', 'receptionist', 'technician', 'pathologist'), updateBookingStatus);
router.put('/:id/assign', authorizeRoles('admin', 'receptionist'), assignTechnician);
router.delete('/:id', authorizeRoles('admin'), cancelBooking);

module.exports = router;
