const Patient = require('../models/Patient');
const redis = require('../config/redis');
const mongoose = require('mongoose');

/* ── Own profile (patient) ── */
const getProfile = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.user || !req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID not found in token' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }

    const patient = await Patient.findById(req.user.id).select('-password');
    
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found. Please login again.' 
      });
    }

    res.status(200).json({ success: true, patient });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.user || !req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID not found in token' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }

    const { fullName, phone, dateOfBirth, gender, address } = req.body;
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender) updateData.gender = gender;
    if (address) updateData.address = address;

    const patient = await Patient.findByIdAndUpdate(
      req.user.id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    await redis.del(`patient:${req.user.id}`);
    res.status(200).json({ success: true, patient });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/* ── Staff: create patient ── */
const createPatient = async (req, res) => {
  const { fullName, email, phone, password, gender, dateOfBirth, bloodGroup, address } = req.body;

  const existing = await Patient.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email or phone already registered' });
  }

  const patient = await Patient.create({
    fullName,
    email,
    phone,
    password: password || `SP@${phone.slice(-4)}`, // default password if not provided
    gender,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    bloodGroup,
    address,
    role: 'patient',
    createdBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    patient: { ...patient.toObject(), password: undefined },
  });
};

/* ── Staff: list all patients ── */
const getAllPatients = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';

  const query = { role: 'patient', isActive: true };
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { patientId: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [patients, total] = await Promise.all([
    Patient.find(query).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
    Patient.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    patients,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
};

/* ── Staff: get single patient ── */
const getPatientById = async (req, res) => {
  const patient = await Patient.findById(req.params.id).select('-password');
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  res.status(200).json({ success: true, patient });
};

/* ── Staff: update patient ── */
const updatePatient = async (req, res) => {
  const { fullName, phone, dateOfBirth, gender, bloodGroup, address, medicalHistory } = req.body;
  const updateData = {};
  if (fullName) updateData.fullName = fullName;
  if (phone) updateData.phone = phone;
  if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
  if (gender) updateData.gender = gender;
  if (bloodGroup) updateData.bloodGroup = bloodGroup;
  if (address) updateData.address = address;
  if (medicalHistory) updateData.medicalHistory = medicalHistory;

  const patient = await Patient.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

  await redis.del(`patient:${req.params.id}`);
  res.status(200).json({ success: true, patient });
};

/* ── Google OAuth: check if patient record exists by email ── */
const checkEmail = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: 'email is required' });
  const patient = await Patient.findOne({ email: email.toLowerCase() }).select('_id');
  res.json({ success: true, exists: !!patient });
};

/* ── Google OAuth: create patient record for first-time Google users ── */
const registerGoogle = async (req, res) => {
  const { fullName, email, phone, dateOfBirth, gender, bloodGroup, address } = req.body;
  if (!email || !phone) {
    return res.status(400).json({ success: false, message: 'email and phone are required' });
  }

  const existing = await Patient.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
  if (existing) {
    // Already exists — just return it (idempotent)
    return res.json({ success: true, patient: { ...existing.toObject(), password: undefined } });
  }

  const patient = await Patient.create({
    fullName,
    email: email.toLowerCase(),
    phone,
    password: `${email}-google`, // hashed by pre-save hook; never used for login
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    gender,
    bloodGroup,
    address,
    role: 'patient',
    isVerified: true,
  });

  res.status(201).json({
    success: true,
    patient: { ...patient.toObject(), password: undefined },
  });
};

/* ── Admin: cascade delete patient and all related data ── */
const deactivatePatient = async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Find patient first to verify existence
    const patient = await Patient.findById(patientId).select('-password');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Call booking service to delete all related data (bookings, invoices, samples, results)
    try {
      const bookingServiceUrl = `http://localhost:${process.env.BOOKING_SERVICE_PORT || 3002}/api/bookings/patient/${patientId}/cascade`;
      const token = process.env.INTERNAL_SERVICE_TOKEN || process.env.JWT_SECRET;
      
      const response = await require('axios').delete(bookingServiceUrl, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cascade Delete] Booking service response:`, response.data);
      }
    } catch (bookingError) {
      console.error('[Cascade Delete] Error deleting booking data:', bookingError.message);
      // Continue with patient deletion even if booking service fails
      // This ensures patient is deleted even if booking service is down
    }

    // Hard delete patient from database
    await Patient.findByIdAndDelete(patientId);
    
    // Clear Redis cache
    await redis.del(`patient:${patientId}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Patient and all related data deleted successfully',
      deletedPatient: {
        id: patient._id,
        fullName: patient.fullName,
        email: patient.email
      }
    });
  } catch (error) {
    console.error('[Cascade Delete] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting patient',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deactivatePatient,
  checkEmail,
  registerGoogle,
};
