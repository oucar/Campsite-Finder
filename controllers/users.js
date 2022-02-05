const User = require('../models/user');

// ! GET REGISTER
module.exports.getRegister = (req, res) => {
    res.render('users/register');
}

// ! POST REGISTER
module.exports.postRegister = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'I hope you enjoy your stay (t)here! ⛰');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

// ! GET LOGIN
module.exports.getLogin = (req, res) => {
    res.render('users/login');
}

// ! POST LOGIN
module.exports.postLogin = (req, res) => {
    req.flash('success', 'Welcome back! ✨');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

// ! LOGOUT
module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye! 😓");
    res.redirect('/campgrounds');
}