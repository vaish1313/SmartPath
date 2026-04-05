const express = require('express');
const path = require('path');
const fs = require('fs');
const Result = require('../models/Result');
const Booking = require('../models/Booking');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authMiddleware);

const STAFF = ['admin', 'lab_technician', 'pathologist', 'receptionist'];

// POST /api/results
router.post('/', authorizeRoles('admin', 'lab_technician'), async (req, res) => {
  const { bookingId, sampleId, patientId, patientName, tests } = req.body;
  const result = await Result.create({
    bookingId, sampleId, patientId, patientName,
    tests, enteredBy: req.user.id,
  });
  res.status(201).json({ success: true, result });
});

// GET /api/results
router.get('/', authorizeRoles(...STAFF), async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [results, total] = await Promise.all([
    Result.find().skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
    Result.countDocuments(),
  ]);
  res.json({ success: true, results, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
});

// GET /api/results/booking/:bookingId
router.get('/booking/:bookingId', authorizeRoles(...STAFF), async (req, res) => {
  const result = await Result.findOne({ bookingId: req.params.bookingId });
  if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
  res.json({ success: true, result });
});

// GET /api/results/patient/:patientId
router.get('/patient/:patientId', async (req, res) => {
  const { patientId } = req.params;
  if (req.user.role === 'patient' && req.user.id !== patientId) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  const results = await Result.find({ patientId }).sort({ createdAt: -1 });
  res.json({ success: true, results });
});

// GET /api/results/:id
router.get('/:id', async (req, res) => {
  const result = await Result.findById(req.params.id);
  if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
  if (req.user.role === 'patient' && result.patientId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  res.json({ success: true, result });
});

// PUT /api/results/:id/approve
router.put('/:id/approve', authorizeRoles('admin', 'pathologist'), async (req, res) => {
  const result = await Result.findByIdAndUpdate(
    req.params.id,
    { approvalStatus: 'approved', reviewedBy: req.user.id },
    { new: true }
  );
  if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
  res.json({ success: true, result });
});

// PUT /api/results/:id/reject
router.put('/:id/reject', authorizeRoles('admin', 'pathologist'), async (req, res) => {
  const { rejectionNote } = req.body;
  const result = await Result.findByIdAndUpdate(
    req.params.id,
    { approvalStatus: 'rejected', rejectionNote, reviewedBy: req.user.id },
    { new: true }
  );
  if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
  res.json({ success: true, result });
});

// POST /api/results/:id/generate-report
router.post('/:id/generate-report', authorizeRoles('admin', 'pathologist', 'lab_technician'), async (req, res) => {
  const result = await Result.findById(req.params.id);
  if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

  const booking = await Booking.findById(result.bookingId);

  // Ensure uploads dir exists
  const uploadsDir = path.join(__dirname, '../../uploads/reports');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const filename = `${result.resultId}.pdf`;
  const filepath = path.join(uploadsDir, filename);

  try {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('SmartPath Diagnostics', { align: 'center' });
    doc.fontSize(11).font('Helvetica').text('Prathamesh Advanced Diagnostic Center', { align: 'center' });
    doc.text('Nashik, Maharashtra | +91 98765 43210', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Patient info
    doc.fontSize(12).font('Helvetica-Bold').text('Patient Information');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Name: ${result.patientName || '—'}`);
    doc.text(`Patient ID: ${result.patientId || '—'}`);
    if (booking) {
      doc.text(`Booking ID: ${booking.bookingId || '—'}`);
      doc.text(`Date: ${booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString('en-IN') : '—'}`);
    }
    doc.text(`Report ID: ${result.resultId}`);
    doc.moveDown();

    // Results table
    doc.fontSize(12).font('Helvetica-Bold').text('Test Results');
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const cols = [50, 180, 280, 340, 420, 490];
    const headers = ['Test Name', 'Value', 'Unit', 'Normal Range', 'Status'];

    doc.fontSize(9).font('Helvetica-Bold');
    headers.forEach((h, i) => doc.text(h, cols[i], tableTop, { width: cols[i + 1] - cols[i] - 5 }));
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(9);
    for (const t of (result.tests || [])) {
      const y = doc.y;
      const isAbnormal = t.status === 'abnormal' || t.status === 'critical';
      if (isAbnormal) doc.fillColor('red'); else doc.fillColor('black');
      doc.text(t.testName || '—', cols[0], y, { width: 125 });
      doc.text(t.value || '—', cols[1], y, { width: 95 });
      doc.text(t.unit || '—', cols[2], y, { width: 55 });
      const range = t.normalRange?.male || t.normalRange?.female || '—';
      doc.text(range, cols[3], y, { width: 65 });
      doc.text((t.status || 'normal').toUpperCase(), cols[4], y, { width: 60 });
      doc.fillColor('black');
      doc.moveDown(0.5);
    }

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Signature
    doc.fontSize(10).text('Reviewed & Approved by:', 50);
    doc.moveDown(2);
    doc.text('_______________________', 50);
    doc.text('Pathologist Signature', 50);
    doc.moveDown();

    // Footer
    doc.fontSize(8).fillColor('grey').text('Prathamesh Advanced Diagnostic Center, Nashik, Maharashtra', { align: 'center' });
    doc.text('This report is computer generated and valid without signature if digitally approved.', { align: 'center' });

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    const reportUrl = `/uploads/reports/${filename}`;
    result.reportUrl = reportUrl;
    await result.save();

    res.json({ success: true, reportUrl, result });
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
});

module.exports = router;
