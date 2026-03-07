const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },
    patientId: {
      type: String,
      required: [true, 'Patient ID is required'],
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientPhone: {
      type: String,
      required: [true, 'Patient phone is required'],
      trim: true,
    },
    tests: [
      {
        testId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Test',
          required: true,
        },
        testName: String,
        testCode: String,
        price: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: [true, 'Final amount is required'],
      min: 0,
    },
    bookingType: {
      type: String,
      required: [true, 'Booking type is required'],
      enum: ['walk-in', 'home-collection'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'sample-collected', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    appointmentSlot: {
      type: String,
      required: [true, 'Appointment slot is required'],
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    collectionAgentId: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online', 'insurance'],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate bookingId before saving
bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.bookingId = `SP-${year}${month}${day}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
