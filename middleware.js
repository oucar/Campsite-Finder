// ? you cannot do something* if you're not authenticate
module.exports.isLoggedIn = (req, res ,next) => {
    // console.log(`req.user: ${req.user}`);
    if(!req.isAuthenticated()){

        // We should forward user to the page he/she was in after he/she logs in.
        // console.log(req.path, req.originalPath);
        req.session.returnTo = req.originalUrl;

        req.flash('error', "You must be signed in! 😓");
        return res.redirect('/login');
    } 
    next();
}

