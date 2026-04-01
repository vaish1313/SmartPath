const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
  {
    testCode: { type: String, unique: true },
    testName: { type: String, required: [true, 'Test name is required'], trim: true },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['hematology', 'biochemistry', 'microbiology', 'immunology', 'urology', 'radiology', 'other'],
    },
    description: { type: String, trim: true },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    discountedPrice: { type: Number, min: 0 },
    normalRange: {
      male: { type: String },
      female: { type: String },
      unit: { type: String },
    },
    turnaroundTime: { type: Number, required: [true, 'Turnaround time is required'], min: 1 }, // in hours
    sampleType: {
      type: String,
      required: [true, 'Sample type is required'],
      enum: ['blood', 'urine', 'stool', 'swab', 'other'],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate testCode before first save
testSchema.pre('save', async function (next) {
  if (this.isNew && !this.testCode) {
    const count = await mongoose.model('Test').countDocuments();
    this.testCode = `TST-${String(1001 + count).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Test', testSchema);
