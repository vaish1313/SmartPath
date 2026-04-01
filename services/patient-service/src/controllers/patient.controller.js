const Patient = require('../models/Patient');
const redis = require('../config/redis');

/* ── Own profile (patient) ── */
const getProfile = async (req, res) => {
  const patient = await Patient.findById(req.user.id).select('-password');
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  res.status(200).json({ success: true, patient });
};

const updateProfile = async (req, res) => {
  const { fullName, phone, dateOfBirth, gender, address } = req.body;
  const updateData = {};
  if (fullName) updateData.fullName = fullName;
  if (phone) updateData.phone = phone;
  if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
  if (gender) updateData.gender = gender;
  if (address) updateData.address = address;

  const patient = await Patient.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true }).select('-password');
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

  await redis.del(`patient:${req.user.id}`);
  res.status(200).json({ success: true, patient });
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

/* ── Admin: soft delete ── */
const deactivatePatient = async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password');
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

  await redis.del(`patient:${req.params.id}`);
  res.status(200).json({ success: true, message: 'Patient deactivated successfully', patient });
};

module.exports = {
  getProfile,
  updateProfile,
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deactivatePatient,
};
