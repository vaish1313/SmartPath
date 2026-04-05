const express = require('express');
const Patient = require('../models/Patient');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authMiddleware);

// GET /api/users?role=technician — internal use for auto-assignment
// Allow any authenticated staff (booking-service calls this with a service token)
router.get('/', async (req, res) => {
  const { role } = req.query;
  const query = { isActive: true };
  if (role) query.role = role;

  const users = await Patient.find(query)
    .select('_id fullName email role phone')
    .sort({ fullName: 1 });

  res.json({ success: true, users });
});

module.exports = router;
