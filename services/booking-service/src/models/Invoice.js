const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, unique: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true, trim: true },
    patientPhone: { type: String, trim: true },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, default: 18 },
    gstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    discount: {
      type: { type: String, enum: ['flat', 'percent'] },
      value: { type: Number, default: 0 },
      reason: { type: String },
    },
    finalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },
    payments: [
      {
        amount: { type: Number, required: true },
        method: { type: String, enum: ['cash', 'upi', 'card', 'online'], required: true },
        transactionId: { type: String },
        paidAt: { type: Date, default: Date.now },
        recordedBy: { type: String },
      },
    ],
    paidAmount: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },
    notes: { type: String, trim: true },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

invoiceSchema.pre('save', async function (next) {
  if (this.isNew && !this.invoiceId) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceId = `INV-${String(100001 + count).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
