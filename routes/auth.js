// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// GET request for signup page
router.get('/signup', authController.getSignup);

// POST request for signup form submission
router.post('/signup', authController.postSignup);

// GET request for login page
router.get('/login', authController.getLogin);

// POST request for login form submission
router.post('/login', authController.postLogin);

module.exports = router;
