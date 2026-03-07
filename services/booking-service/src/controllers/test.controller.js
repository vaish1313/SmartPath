const Test = require('../models/Test');
const redis = require('../config/redis');

const getAllTests = async (req, res) => {
  const { category, sampleType, search } = req.query;

  // Build cache key based on query params
  const cacheKey = `tests:all:${category || 'all'}:${sampleType || 'all'}:${search || 'none'}`;

  // Try Redis cache first
  const cachedTests = await redis.get(cacheKey);
  if (cachedTests) {
    return res.status(200).json({
      success: true,
      tests: JSON.parse(cachedTests),
      cached: true,
    });
  }

  // Build query
  const query = { isActive: true };
  if (category) query.category = category;
  if (sampleType) query.sampleType = sampleType;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  const tests = await Test.find(query).sort({ name: 1 });

  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(tests));

  res.status(200).json({
    success: true,
    tests,
  });
};

const getTestById = async (req, res) => {
  const testId = req.params.id;
  const cacheKey = `test:${testId}`;

  // Try Redis cache first
  const cachedTest = await redis.get(cacheKey);
  if (cachedTest) {
    return res.status(200).json({
      success: true,
      test: JSON.parse(cachedTest),
      cached: true,
    });
  }

  const test = await Test.findById(testId);

  if (!test) {
    return res.status(404).json({
      success: false,
      message: 'Test not found',
    });
  }

  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(test));

  res.status(200).json({
    success: true,
    test,
  });
};

const createTest = async (req, res) => {
  const test = await Test.create(req.body);

  // Invalidate all tests cache
  const keys = await redis.keys('tests:all:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }

  res.status(201).json({
    success: true,
    test,
  });
};

const updateTest = async (req, res) => {
  const test = await Test.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!test) {
    return res.status(404).json({
      success: false,
      message: 'Test not found',
    });
  }

  // Invalidate caches
  await redis.del(`test:${req.params.id}`);
  const keys = await redis.keys('tests:all:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }

  res.status(200).json({
    success: true,
    test,
  });
};

const deleteTest = async (req, res) => {
  const test = await Test.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!test) {
    return res.status(404).json({
      success: false,
      message: 'Test not found',
    });
  }

  // Invalidate caches
  await redis.del(`test:${req.params.id}`);
  const keys = await redis.keys('tests:all:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }

  res.status(200).json({
    success: true,
    message: 'Test deactivated successfully',
  });
};

module.exports = {
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
};
