const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    packageCode: { type: String, unique: true },
    packageName: { type: String, required: [true, 'Package name is required'], trim: true },
    description: { type: String, trim: true },
    tests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true }],
    originalPrice: { type: Number, min: 0 }, // auto-calculated from tests
    discountedPrice: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate packageCode before first save
packageSchema.pre('save', async function (next) {
  if (this.isNew && !this.packageCode) {
    const count = await mongoose.model('Package').countDocuments();
    this.packageCode = `PKG-${String(1001 + count).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Package', packageSchema);
