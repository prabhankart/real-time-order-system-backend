const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validate, registerSchema, loginSchema } = require('../validation/schemas');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

module.exports = router;