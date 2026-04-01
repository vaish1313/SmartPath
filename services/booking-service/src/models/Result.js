const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    resultId: { type: String, unique: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    sampleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sample' },
    patientId: { type: String, required: true },
    patientName: { type: String, trim: true },
    tests: [
      {
        testId: { type: mongoose.Schema.Types.ObjectId },
        testName: { type: String },
        value: { type: String },
        unit: { type: String },
        normalRange: { male: String, female: String },
        status: { type: String, enum: ['normal', 'abnormal', 'critical'], default: 'normal' },
      },
    ],
    enteredBy: { type: String }, // lab_technician user id
    reviewedBy: { type: String }, // pathologist user id
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionNote: { type: String, trim: true },
    reportUrl: { type: String },
  },
  { timestamps: true }
);

resultSchema.pre('save', async function (next) {
  if (this.isNew && !this.resultId) {
    const count = await mongoose.model('Result').countDocuments();
    this.resultId = `RES-${String(100001 + count).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Result', resultSchema);
