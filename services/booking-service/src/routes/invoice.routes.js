const express = require('express');
const path = require('path');
const fs = require('fs');
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authMiddleware);

const STAFF = ['admin', 'receptionist'];

/* ── helpers ── */
function calcAmounts(subtotal, gstRate, discount) {
  const gstAmount = parseFloat(((subtotal * gstRate) / 100).toFixed(2));
  const totalAmount = parseFloat((subtotal + gstAmount).toFixed(2));
  let discountAmt = 0;
  if (discount?.value > 0) {
    discountAmt = discount.type === 'percent'
      ? parseFloat(((totalAmount * discount.value) / 100).toFixed(2))
      : parseFloat(discount.value.toFixed(2));
  }
  const finalAmount = parseFloat((totalAmount - discountAmt).toFixed(2));
  return { gstAmount, totalAmount, finalAmount };
}

function recalcPayment(invoice) {
  const paid = invoice.payments.reduce((s, p) => s + p.amount, 0);
  invoice.paidAmount = parseFloat(paid.toFixed(2));
  invoice.balanceAmount = parseFloat((invoice.finalAmount - paid).toFixed(2));
  if (paid <= 0) invoice.paymentStatus = 'unpaid';
  else if (paid >= invoice.finalAmount) invoice.paymentStatus = 'paid';
  else invoice.paymentStatus = 'partial';
}

/* ── POST /api/invoices ── */
router.post('/', authorizeRoles(...STAFF), async (req, res) => {
  const { bookingId, discount, notes, gstRate = 18 } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  // Build items from booking tests + packages
  const items = [];
  for (const t of (booking.tests || [])) {
    items.push({ description: t.testName || 'Test', quantity: 1, unitPrice: t.price || 0, totalPrice: t.price || 0 });
  }
  for (const p of (booking.packages || [])) {
    items.push({ description: p.packageName || 'Package', quantity: 1, unitPrice: p.price || 0, totalPrice: p.price || 0 });
  }
  if (!items.length) {
    // fallback to finalAmount
    items.push({ description: 'Diagnostic Services', quantity: 1, unitPrice: booking.finalAmount || 0, totalPrice: booking.finalAmount || 0 });
  }

  const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
  const { gstAmount, totalAmount, finalAmount } = calcAmounts(subtotal, gstRate, discount);

  const invoice = await Invoice.create({
    bookingId,
    patientId: booking.patientId,
    patientName: booking.patientName,
    patientPhone: booking.patientPhone,
    items, subtotal, gstRate, gstAmount, totalAmount,
    discount: discount || {},
    finalAmount,
    balanceAmount: finalAmount,
    notes,
  });

  res.status(201).json({ success: true, invoice });
});

/* ── GET /api/invoices ── */
router.get('/', authorizeRoles(...STAFF), async (req, res) => {
  const { page = 1, limit = 15, paymentStatus, search, startDate, endDate } = req.query;
  const query = {};
  if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;
  if (search) query.$or = [
    { invoiceId: { $regex: search, $options: 'i' } },
    { patientName: { $regex: search, $options: 'i' } },
  ];
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startOfDay(new Date(startDate));
    if (endDate) query.createdAt.$lte = endOfDay(new Date(endDate));
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [invoices, total] = await Promise.all([
    Invoice.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
    Invoice.countDocuments(query),
  ]);
  res.json({ success: true, invoices, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
});

/* ── GET /api/invoices/booking/:bookingId ── */
router.get('/booking/:bookingId', async (req, res) => {
  const invoice = await Invoice.findOne({ bookingId: req.params.bookingId });
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
  if (req.user.role === 'patient' && invoice.patientId !== req.user.id)
    return res.status(403).json({ success: false, message: 'Access denied' });
  res.json({ success: true, invoice });
});

/* ── GET /api/invoices/patient/:patientId ── */
router.get('/patient/:patientId', async (req, res) => {
  if (req.user.role === 'patient' && req.user.id !== req.params.patientId)
    return res.status(403).json({ success: false, message: 'Access denied' });
  const invoices = await Invoice.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
  res.json({ success: true, invoices });
});

/* ── GET /api/invoices/:id ── */
router.get('/:id', async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
  if (req.user.role === 'patient' && invoice.patientId !== req.user.id)
    return res.status(403).json({ success: false, message: 'Access denied' });
  res.json({ success: true, invoice });
});

/* ── PUT /api/invoices/:id ── */
router.put('/:id', authorizeRoles(...STAFF), async (req, res) => {
  const { discount, notes, gstRate } = req.body;
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

  if (discount !== undefined) invoice.discount = discount;
  if (notes !== undefined) invoice.notes = notes;
  if (gstRate !== undefined) invoice.gstRate = gstRate;

  const { gstAmount, totalAmount, finalAmount } = calcAmounts(invoice.subtotal, invoice.gstRate, invoice.discount);
  invoice.gstAmount = gstAmount;
  invoice.totalAmount = totalAmount;
  invoice.finalAmount = finalAmount;
  recalcPayment(invoice);

  await invoice.save();
  res.json({ success: true, invoice });
});

/* ── POST /api/invoices/:id/payment ── */
router.post('/:id/payment', authorizeRoles(...STAFF), async (req, res) => {
  const { amount, method, transactionId } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Valid amount required' });

  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

  invoice.payments.push({ amount: parseFloat(amount), method, transactionId, paidAt: new Date(), recordedBy: req.user.id });
  recalcPayment(invoice);
  await invoice.save();

  // Sync booking paymentStatus
  const statusMap = { unpaid: 'unpaid', partial: 'partial', paid: 'paid' };
  await Booking.findByIdAndUpdate(invoice.bookingId, { paymentStatus: statusMap[invoice.paymentStatus] || 'unpaid' });

  res.json({ success: true, invoice });
});

/* ── POST /api/invoices/:id/generate-pdf ── */
router.post('/:id/generate-pdf', authorizeRoles(...STAFF), async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

  const dir = path.join(__dirname, '../../uploads/invoices');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = `${invoice.invoiceId}.pdf`;
  const filepath = path.join(dir, filename);

  try {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('SmartPath Diagnostics', { align: 'center' });
    doc.fontSize(11).font('Helvetica').text('Prathamesh Advanced Diagnostic Center', { align: 'center' });
    doc.text('Nashik, Maharashtra | GSTIN: 27XXXXX0000X1ZX', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Invoice meta
    doc.fontSize(10).font('Helvetica-Bold').text(`INVOICE`, { align: 'right' });
    doc.font('Helvetica').text(`Invoice No: ${invoice.invoiceId}`, { align: 'right' });
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, { align: 'right' });
    doc.moveDown(0.5);

    // Patient
    doc.font('Helvetica-Bold').text('Bill To:');
    doc.font('Helvetica').text(invoice.patientName);
    if (invoice.patientPhone) doc.text(`Phone: ${invoice.patientPhone}`);
    doc.text(`Patient ID: ${invoice.patientId}`);
    doc.moveDown();

    // Items table
    doc.font('Helvetica-Bold').fontSize(9);
    const cols = [50, 280, 340, 400, 470];
    const headers = ['Description', 'Qty', 'Unit Price', 'Total'];
    headers.forEach((h, i) => doc.text(h, cols[i], doc.y, { width: cols[i + 1] - cols[i] - 5 }));
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(9);
    for (const item of invoice.items) {
      const y = doc.y;
      doc.text(item.description, cols[0], y, { width: 225 });
      doc.text(String(item.quantity), cols[1], y, { width: 55 });
      doc.text(`₹${item.unitPrice}`, cols[2], y, { width: 55 });
      doc.text(`₹${item.totalPrice}`, cols[3], y, { width: 75 });
      doc.moveDown(0.5);
    }

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Totals
    const right = 400;
    doc.font('Helvetica').text(`Subtotal:`, right, doc.y); doc.text(`₹${invoice.subtotal}`, 470, doc.y - doc.currentLineHeight()); doc.moveDown(0.4);
    doc.text(`GST (${invoice.gstRate}%):`, right, doc.y); doc.text(`₹${invoice.gstAmount}`, 470, doc.y - doc.currentLineHeight()); doc.moveDown(0.4);
    if (invoice.discount?.value > 0) {
      doc.text(`Discount:`, right, doc.y); doc.text(`-₹${(invoice.totalAmount - invoice.finalAmount).toFixed(2)}`, 470, doc.y - doc.currentLineHeight()); doc.moveDown(0.4);
    }
    doc.font('Helvetica-Bold').text(`Total Amount:`, right, doc.y); doc.text(`₹${invoice.finalAmount}`, 470, doc.y - doc.currentLineHeight()); doc.moveDown(0.4);
    doc.font('Helvetica').text(`Paid Amount:`, right, doc.y); doc.text(`₹${invoice.paidAmount}`, 470, doc.y - doc.currentLineHeight()); doc.moveDown(0.4);

    const balance = invoice.balanceAmount;
    if (balance > 0) {
      doc.fillColor('red').font('Helvetica-Bold').text(`Balance Due:`, right, doc.y);
      doc.text(`₹${balance}`, 470, doc.y - doc.currentLineHeight());
      doc.fillColor('black');
    } else {
      doc.fillColor('green').font('Helvetica-Bold').text(`PAID IN FULL`, right, doc.y);
      doc.fillColor('black');
    }
    doc.moveDown();

    // Payment history
    if (invoice.payments.length > 0) {
      doc.font('Helvetica-Bold').fontSize(10).text('Payment History');
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(9);
      for (const p of invoice.payments) {
        doc.text(`${new Date(p.paidAt).toLocaleDateString('en-IN')} — ₹${p.amount} via ${p.method}${p.transactionId ? ` (Txn: ${p.transactionId})` : ''}`);
      }
      doc.moveDown();
    }

    // Footer
    doc.fontSize(8).fillColor('grey').text('Prathamesh Advanced Diagnostic Center, Nashik, Maharashtra', { align: 'center' });
    doc.text('Thank you for choosing SmartPath Diagnostics.', { align: 'center' });

    doc.end();
    await new Promise((resolve, reject) => { stream.on('finish', resolve); stream.on('error', reject); });

    invoice.pdfUrl = `/uploads/invoices/${filename}`;
    await invoice.save();

    res.json({ success: true, pdfUrl: invoice.pdfUrl, invoice });
  } catch (err) {
    console.error('Invoice PDF error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate PDF' });
  }
});

module.exports = router;
