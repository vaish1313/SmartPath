const express = require('express');
const Package = require('../models/Package');
const Test = require('../models/Test');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

// GET /api/packages
router.get('/', async (req, res) => {
  const packages = await Package.find({ isActive: true }).populate('tests', 'testName testCode price').sort({ createdAt: -1 });
  res.json({ success: true, packages });
});

// GET /api/packages/:id
router.get('/:id', async (req, res) => {
  const pkg = await Package.findById(req.params.id).populate('tests');
  if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
  res.json({ success: true, package: pkg });
});

// POST /api/packages — admin only
router.post('/', authorizeRoles('admin'), async (req, res) => {
  const { packageName, description, tests, discountedPrice } = req.body;

  // Calculate originalPrice from selected tests
  const testDocs = await Test.find({ _id: { $in: tests }, isActive: true });
  const originalPrice = testDocs.reduce((sum, t) => sum + t.price, 0);

  const pkg = await Package.create({ packageName, description, tests, originalPrice, discountedPrice });
  await pkg.populate('tests', 'testName testCode price');
  res.status(201).json({ success: true, package: pkg });
});

// PUT /api/packages/:id — admin only
router.put('/:id', authorizeRoles('admin'), async (req, res) => {
  const { tests, ...rest } = req.body;

  // Recalculate originalPrice if tests changed
  if (tests) {
    const testDocs = await Test.find({ _id: { $in: tests }, isActive: true });
    rest.originalPrice = testDocs.reduce((sum, t) => sum + t.price, 0);
    rest.tests = tests;
  }

  const pkg = await Package.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true }).populate('tests', 'testName testCode price');
  if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
  res.json({ success: true, package: pkg });
});

// DELETE /api/packages/:id — soft delete, admin only
router.delete('/:id', authorizeRoles('admin'), async (req, res) => {
  const pkg = await Package.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
  res.json({ success: true, message: 'Package deactivated' });
});

module.exports = router;
