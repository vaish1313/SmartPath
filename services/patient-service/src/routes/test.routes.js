const express = require('express');
const Test = require('../models/Test');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Public catalog — no auth required
router.get('/catalog', async (req, res) => {
  const tests = await Test.find({ isActive: true }).sort({ testName: 1 }).lean();
  // Add backward compatibility: ensure both old and new field names exist
  const testsWithCompat = tests.map(t => ({
    ...t,
    name: t.name || t.testName,
    testName: t.testName || t.name,
    code: t.code || t.testCode,
    testCode: t.testCode || t.code,
  }));
  res.json({ success: true, tests: testsWithCompat });
});

// All other routes require auth
router.use(authMiddleware);

// GET /api/tests — paginated + search
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';
  const category = req.query.category || '';

  const query = { isActive: true };
  if (search) {
    query.$or = [
      { testName: { $regex: search, $options: 'i' } },
      { testCode: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) query.category = category;

  const skip = (page - 1) * limit;
  const [tests, total] = await Promise.all([
    Test.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
    Test.countDocuments(query),
  ]);

  // Add backward compatibility: ensure both old and new field names exist
  const testsWithCompat = tests.map(t => ({
    ...t,
    name: t.name || t.testName,
    testName: t.testName || t.name,
    code: t.code || t.testCode,
    testCode: t.testCode || t.code,
  }));

  res.json({ success: true, tests: testsWithCompat, total, page, totalPages: Math.ceil(total / limit) });
});

// GET /api/tests/:id
router.get('/:id', async (req, res) => {
  const test = await Test.findById(req.params.id).lean();
  if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
  // Add backward compatibility
  const testWithCompat = {
    ...test,
    name: test.name || test.testName,
    testName: test.testName || test.name,
    code: test.code || test.testCode,
    testCode: test.testCode || test.code,
  };
  res.json({ success: true, test: testWithCompat });
});

// POST /api/tests — admin only
router.post('/', authorizeRoles('admin'), async (req, res) => {
  const test = await Test.create(req.body);
  res.status(201).json({ success: true, test });
});

// PUT /api/tests/:id — admin only
router.put('/:id', authorizeRoles('admin'), async (req, res) => {
  const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
  res.json({ success: true, test });
});

// DELETE /api/tests/:id — soft delete, admin only
router.delete('/:id', authorizeRoles('admin'), async (req, res) => {
  const test = await Test.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
  res.json({ success: true, message: 'Test deactivated' });
});

module.exports = router;
