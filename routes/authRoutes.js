const express = require('express');
const register = require('../controllers/authController').registerUser;
const login = require('../controllers/authController').loginUser;
const router = express.Router();

router.post('/login', login);
router.post('/register', register);

module.exports = router;
