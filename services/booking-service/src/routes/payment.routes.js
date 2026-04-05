const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Invoice = require('../models/Invoice');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Lazy init — only created when first request hits, so missing env vars don't crash startup
function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/* ─────────────────────────────────────────────
   POST /api/payments/create-order
   Authenticated — patient or staff
───────────────────────────────────────────── */
router.post('/create-order', authMiddleware, async (req, res) => {
  const { invoiceId } = req.body;

  if (!invoiceId) {
    return res.status(400).json({ success: false, message: 'invoiceId is required' });
  }

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found' });
  }

  // Patients can only pay their own invoices
  if (req.user.role === 'patient' && invoice.patientId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  if (invoice.paymentStatus === 'paid') {
    return res.status(400).json({ success: false, message: 'Invoice already paid' });
  }

  // Amount in paise (Razorpay requires smallest currency unit)
  const amountInPaise = Math.round(invoice.balanceAmount * 100);

  const order = await getRazorpay().orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: invoice.invoiceId,
    notes: {
      invoiceId: invoice._id.toString(),
      patientId: invoice.patientId,
    },
  });

  // Save orderId on invoice
  invoice.razorpayOrderId = order.id;
  await invoice.save();

  res.json({
    success: true,
    orderId: order.id,
    keyId: process.env.RAZORPAY_KEY_ID,
    amount: amountInPaise,
    currency: 'INR',
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceId,
  });
});

/* ─────────────────────────────────────────────
   POST /api/payments/verify
   Authenticated — verifies HMAC signature
───────────────────────────────────────────── */
router.post('/verify', authMiddleware, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !invoiceId) {
    return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
  }

  // Recompute HMAC — never trust client-sent status
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
  }

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found' });
  }

  // Mark invoice as paid
  invoice.razorpayPaymentId = razorpay_payment_id;
  invoice.paymentMethod = 'online';
  invoice.paidAt = new Date();
  invoice.payments.push({
    amount: invoice.balanceAmount,
    method: 'online',
    transactionId: razorpay_payment_id,
    paidAt: new Date(),
    recordedBy: req.user.id,
  });
  invoice.paidAmount = invoice.finalAmount;
  invoice.balanceAmount = 0;
  invoice.paymentStatus = 'paid';
  await invoice.save();

  res.json({ success: true, message: 'Payment verified and recorded', invoice });
});

/* ─────────────────────────────────────────────
   POST /api/payments/webhook
   Unauthenticated — raw body required
   Registered BEFORE express.json() in index.js
───────────────────────────────────────────── */
router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  if (!signature) {
    return res.status(400).json({ success: false, message: 'Missing signature' });
  }

  // Validate webhook signature using raw body
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.body) // req.body is Buffer when express.raw() is used
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
  }

  // Handle payment.captured event (safety net)
  if (event.event === 'payment.captured') {
    const payment = event.payload?.payment?.entity;
    if (!payment) return res.json({ success: true });

    const orderId = payment.order_id;
    const paymentId = payment.id;

    const invoice = await Invoice.findOne({ razorpayOrderId: orderId });
    if (invoice && invoice.paymentStatus !== 'paid') {
      invoice.razorpayPaymentId = paymentId;
      invoice.paymentMethod = 'online';
      invoice.paidAt = new Date();
      if (!invoice.payments.some((p) => p.transactionId === paymentId)) {
        invoice.payments.push({
          amount: invoice.balanceAmount,
          method: 'online',
          transactionId: paymentId,
          paidAt: new Date(),
        });
      }
      invoice.paidAmount = invoice.finalAmount;
      invoice.balanceAmount = 0;
      invoice.paymentStatus = 'paid';
      await invoice.save();
    }
  }

  res.json({ success: true });
});

module.exports = router;
