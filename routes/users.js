const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');

// catch, controller
const catchAsync = require('../utils/catchAsync');
const userController = require('../controllers/users')

// ! ROUTES
// Register
router.get('/register', userController.getRegister);
router.post('/register', catchAsync(userController.postRegister));

// Login
router.get('/login', userController.getLogin);
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), userController.postLogin);

// Logout
router.get('/logout', userController.logout);

module.exports = router;