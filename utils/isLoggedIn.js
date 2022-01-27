// ? you cannot do something* if you're not authenticate
module.exports.isLoggedIn = (req, res ,next) =>{
    if(!req.isAuthenticated){
        req.flash('error', "You must be signed in! 😓");
        return res.redirect('/login');
    } 
    next();
}

