const express = require('express');
const {
  getProfile,
  updateProfile,
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deactivatePatient,
} = require('../controllers/patient.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');
const { validate, updateProfileSchema } = require('../validators/auth.validator');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Own profile (any authenticated user)
router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);

// Staff routes
router.post('/', authorizeRoles('admin', 'receptionist'), createPatient);
router.get('/', authorizeRoles('admin', 'receptionist', 'lab_technician', 'pathologist'), getAllPatients);
router.get('/:id', authorizeRoles('admin', 'receptionist', 'lab_technician', 'pathologist'), getPatientById);
router.put('/:id', authorizeRoles('admin', 'receptionist'), updatePatient);
router.delete('/:id', authorizeRoles('admin'), deactivatePatient);

module.exports = router;
