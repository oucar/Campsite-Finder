const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');

// catch
const catchAsync = require('../utils/catchAsync');

// Register
router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async(req, res, next ) => {

    try {
        // res.send(req.body);
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        console.log(`USER REGISTERED!!: ${registeredUser}`);

        // you need a callback :(
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success','I hope you enjoy your stay here! 👀');
            res.redirect('/campgrounds');
        });

    } catch (error) {
        req.flash('error',error.message);
        res.redirect('/register');
    }
}))

// Login
router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'Welcome back! ✨');
    // redirectUrl is returnTo (if exists) or  '/campgrounds'
    if(!req.session.returnTo){
        res.redirect('/campgrounds');
    } else {
        delete req.session.returnTo;
        res.redirect(req.session.returnTo);
    }
})

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye! :)")
    res.redirect('/campgrounds');

})

module.exports = router;