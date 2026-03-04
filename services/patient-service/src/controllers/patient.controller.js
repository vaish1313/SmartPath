const Patient = require('../models/Patient');
const redis = require('../config/redis');

const getProfile = async (req, res) => {
  const patient = await Patient.findById(req.user.id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  res.status(200).json({
    success: true,
    patient,
  });
};

const updateProfile = async (req, res) => {
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
  );

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  // Invalidate Redis cache
  await redis.del(`patient:${req.user.id}`);

  res.status(200).json({
    success: true,
    patient,
  });
};

const getAllPatients = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';

  const query = {};
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [patients, total] = await Promise.all([
    Patient.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Patient.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    patients,
    total,
    page,
    totalPages,
  });
};

const getPatientById = async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  res.status(200).json({
    success: true,
    patient,
  });
};

const deactivatePatient = async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  // Invalidate Redis cache
  await redis.del(`patient:${req.params.id}`);

  res.status(200).json({
    success: true,
    message: 'Patient deactivated successfully',
    patient,
  });
};

module.exports = {
  getProfile,
  updateProfile,
  getAllPatients,
  getPatientById,
  deactivatePatient,
};
