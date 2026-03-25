const express = require('express');
const {
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
} = require('../controllers/test.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');
const { validate, createTestSchema } = require('../validators/booking.validator');

const router = express.Router();

router.get('/', getAllTests);
router.get('/:id', getTestById);
router.post('/', authMiddleware, authorizeRoles('admin'), validate(createTestSchema), createTest);
router.put('/:id', authMiddleware, authorizeRoles('admin'), updateTest);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteTest);

module.exports = router;
