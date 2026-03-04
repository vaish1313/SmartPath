const express = require('express');
const { register, login, getMe, logout } = require('../controllers/auth.controller');
const { validate, registerSchema, loginSchema } = require('../validators/auth.validator');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);

module.exports = router;
