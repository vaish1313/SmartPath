const mongoose = require('mongoose');

const sampleSchema = new mongoose.Schema(
  {
    sampleId: { type: String, unique: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true, trim: true },
    barcode: { type: String, unique: true },
    collectedBy: { type: String }, // staff user id
    collectedAt: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'collected', 'processing', 'completed', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, trim: true },
  },
  { timestamps: true }
);

sampleSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Sample').countDocuments();
    this.sampleId = `SMP-${String(100001 + count).padStart(6, '0')}`;
    this.barcode = `BC${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
  }
  next();
});

module.exports = mongoose.model('Sample', sampleSchema);
