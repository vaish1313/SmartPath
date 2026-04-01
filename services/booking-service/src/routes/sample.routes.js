const express = require('express');
const Sample = require('../models/Sample');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');
const { startOfDay, endOfDay } = require('date-fns');

const router = express.Router();
router.use(authMiddleware);

const STAFF = ['admin', 'technician', 'pathologist', 'receptionist'];

// POST /api/samples
router.post('/', authorizeRoles('admin', 'technician', 'receptionist'), async (req, res) => {
  const { bookingId, patientId, patientName } = req.body;
  const sample = await Sample.create({
    bookingId, patientId, patientName,
    collectedBy: req.user.id,
    collectedAt: new Date(),
    status: 'collected',
  });
  res.status(201).json({ success: true, sample });
});

// GET /api/samples
router.get('/', authorizeRoles(...STAFF), async (req, res) => {
  const { status, date, limit = 50, page = 1 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (date) {
    const d = new Date(date);
    query.createdAt = { $gte: startOfDay(d), $lte: endOfDay(d) };
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [samples, total] = await Promise.all([
    Sample.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
    Sample.countDocuments(query),
  ]);
  res.json({ success: true, samples, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
});

// GET /api/samples/booking/:bookingId
router.get('/booking/:bookingId', authorizeRoles(...STAFF), async (req, res) => {
  const sample = await Sample.findOne({ bookingId: req.params.bookingId });
  if (!sample) return res.status(404).json({ success: false, message: 'Sample not found' });
  res.json({ success: true, sample });
});

// GET /api/samples/:id
router.get('/:id', authorizeRoles(...STAFF), async (req, res) => {
  const sample = await Sample.findById(req.params.id);
  if (!sample) return res.status(404).json({ success: false, message: 'Sample not found' });
  res.json({ success: true, sample });
});

// PUT /api/samples/:id/status
router.put('/:id/status', authorizeRoles('admin', 'technician'), async (req, res) => {
  const { status, rejectionReason } = req.body;
  const update = { status };
  if (status === 'rejected' && rejectionReason) update.rejectionReason = rejectionReason;
  const sample = await Sample.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!sample) return res.status(404).json({ success: false, message: 'Sample not found' });
  res.json({ success: true, sample });
});

module.exports = router;
