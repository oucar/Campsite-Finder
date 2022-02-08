const {campgroundSchema} = require('./schemas');
const {reviewSchema} = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');


// ! Server Side check if logged in 
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

// ! Server Side Error Handling Middleware
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error) {
        // turn array into a string
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        // or
        next();
    }
}

// ! Server Side Authorization Middleware
// Protecting agains Postman submissions and accessing pages like edit and delete by typing the url
// needs to be async because it needs to "await" for the campground
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // if author id is not equal to the requester's id
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to perform this action!');
        res.redirect(`/campgrounds/${id}`);
    } 
    // you do have permission to edit/delete
    next();
}

// ! Server Side Authorization Middleware
// Protecting agains Postman submissions and accessing pages like edit and delete by typing the url
// makes sure that only the review author can delete a review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    // if author id is not equal to the requester's id
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to perform this action!');
        res.redirect(`/campgrounds/${id}`);
    } 
    // you do have permission to delete
    next();
}

// ! Review Validation
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        // turn array into a string
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        // or
        next();
    }
}