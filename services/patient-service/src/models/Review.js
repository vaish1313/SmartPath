const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true },
    patientName: { type: String, required: true, trim: true },
    bookingId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true, trim: true, maxlength: 500 },
    isApproved: { type: Boolean, default: true }, // auto-approve; set false to moderate
  },
  { timestamps: true }
);

// One review per booking
reviewSchema.index({ bookingId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
