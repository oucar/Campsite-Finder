const express = require('express');
const router = express.Router();
const User = require('../models/user');

// catch
const catchAsync = require('../utils/catchAsync');

// Register
router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async(req,res ) => {

    try {
        // res.send(req.body);
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        // console.log(registeredUser);

        req.flash('success','I hope you enjoy your stay here! 👀');
        res.redirect('/campgrounds');
    } catch (error) {
        req.flash('error',error.message);
        res.redirect('/register');
    }
}))

// Login
router.get('/login', (req, res) => {
    res.render('users/login');
})


module.exports = router;