const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const redis = require('../config/redis');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async (req, res) => {
  const { fullName, email, phone, password, gender, dateOfBirth } = req.body;

  // Check if email or phone already exists
  const existingPatient = await Patient.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingPatient) {
    return res.status(409).json({
      success: false,
      message: 'Email or phone already exists',
    });
  }

  // Create new patient
  const patient = await Patient.create({
    fullName,
    email,
    phone,
    password,
    gender,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
  });

  // Generate JWT token
  const token = generateToken({
    id: patient._id,
    email: patient.email,
    role: patient.role,
  });

  res.status(201).json({
    success: true,
    token,
    patient: {
      id: patient._id,
      fullName: patient.fullName,
      email: patient.email,
      role: patient.role,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // Find patient and explicitly select password
  const patient = await Patient.findOne({ email }).select('+password');

  if (!patient) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  // Check password
  const isPasswordValid = await patient.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  // Update last login
  patient.lastLogin = new Date();
  await patient.save();

  // Cache patient data in Redis for 1 hour
  const patientData = {
    id: patient._id,
    fullName: patient.fullName,
    email: patient.email,
    role: patient.role,
    phone: patient.phone,
  };
  await redis.setex(`patient:${patient._id}`, 3600, JSON.stringify(patientData));

  // Generate JWT token
  const token = generateToken({
    id: patient._id,
    email: patient.email,
    role: patient.role,
  });

  res.status(200).json({
    success: true,
    token,
    patient: {
      id: patient._id,
      fullName: patient.fullName,
      email: patient.email,
      role: patient.role,
    },
  });
};

const getMe = async (req, res) => {
  const patientId = req.user.id;

  // Try to get from Redis cache first
  const cachedPatient = await redis.get(`patient:${patientId}`);

  if (cachedPatient) {
    return res.status(200).json({
      success: true,
      patient: JSON.parse(cachedPatient),
    });
  }

  // If not in cache, fetch from MongoDB
  const patient = await Patient.findById(patientId);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  // Cache it for future requests
  const patientData = {
    id: patient._id,
    fullName: patient.fullName,
    email: patient.email,
    role: patient.role,
    phone: patient.phone,
    gender: patient.gender,
    dateOfBirth: patient.dateOfBirth,
    address: patient.address,
  };
  await redis.setex(`patient:${patientId}`, 3600, JSON.stringify(patientData));

  res.status(200).json({
    success: true,
    patient: patientData,
  });
};

const logout = async (req, res) => {
  const patientId = req.user.id;

  // Delete Redis cache
  await redis.del(`patient:${patientId}`);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
