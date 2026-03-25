const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Test name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Test code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['hematology', 'biochemistry', 'microbiology', 'immunology', 'urology', 'radiology', 'other'],
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    discountedPrice: {
      type: Number,
      min: 0,
    },
    preparationInstructions: {
      type: String,
      trim: true,
    },
    turnaroundTime: {
      type: String,
      required: [true, 'Turnaround time is required'],
      trim: true,
    },
    sampleType: {
      type: String,
      required: [true, 'Sample type is required'],
      enum: ['blood', 'urine', 'stool', 'swab', 'other'],
    },
    normalRanges: [
      {
        parameter: String,
        min: Number,
        max: Number,
        unit: String,
        gender: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isHomeCollectionAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Test', testSchema);
