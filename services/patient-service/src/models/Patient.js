const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
      sparse: true, // auto-generated, not required at schema level
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    medicalHistory: [
      {
        condition: { type: String, required: true },
        diagnosedDate: { type: Date },
        notes: { type: String },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient', // staff user who registered this patient
    },
    role: {
      type: String,
      enum: ['patient', 'lab_technician', 'pathologist', 'admin', 'receptionist'],
      default: 'patient',
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Auto-generate patientId before first save
patientSchema.pre('save', async function (next) {
  // Generate patientId only for new patient-role documents
  if (this.isNew && this.role === 'patient' && !this.patientId) {
    const count = await mongoose.model('Patient').countDocuments({ role: 'patient' });
    this.patientId = `SP-${String(100001 + count).padStart(6, '0')}`;
  }

  // Hash password if modified
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

patientSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Patient', patientSchema);
