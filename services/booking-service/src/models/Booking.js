const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true },
    patientId: { type: String, required: [true, 'Patient ID is required'] },
    patientName: { type: String, required: [true, 'Patient name is required'], trim: true },
    patientPhone: { type: String, trim: true },
    tests: [
      {
        testId: { type: mongoose.Schema.Types.ObjectId },
        testName: String,
        testCode: String,
        price: Number,
      },
    ],
    packages: [
      {
        packageId: { type: mongoose.Schema.Types.ObjectId },
        packageName: String,
        price: Number,
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    collectionType: {
      type: String,
      required: true,
      enum: ['walk-in', 'home-collection'],
    },
    collectionAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    scheduledDate: { type: Date, required: [true, 'Scheduled date is required'] },
    scheduledTime: { type: String, required: [true, 'Scheduled time slot is required'], trim: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'sample-collected', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'partial'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online', 'insurance'],
    },
    assignedTechnician: { type: String }, // staff user id
    assignedPathologist: { type: String }, // pathologist user id
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Auto-generate bookingId
bookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingId = `BK-${String(100001 + count).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
