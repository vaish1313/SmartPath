const express = require('express');
const {
  getProfile,
  updateProfile,
  getAllPatients,
  getPatientById,
  deactivatePatient,
} = require('../controllers/patient.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');
const { validate, updateProfileSchema } = require('../validators/auth.validator');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.get('/', authorizeRoles('admin'), getAllPatients);
router.get('/:id', authorizeRoles('admin', 'pathologist', 'technician'), getPatientById);
router.delete('/:id', authorizeRoles('admin'), deactivatePatient);

module.exports = router;
