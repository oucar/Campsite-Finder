const express = require('express');
const router = express.Router();

// utils, validation
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

// models, schemas
const Campground = require('../models/campground');
const Review = require('../models/review');
const {campgroundSchema, reviewSchema} = require('../schemas');


// ! Server Side Error Handling Middleware
const validateCampground = (req, res, next) => {
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

// ! Review Validation
const validateReview = (req, res, next) => {
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

// ! ROUTES
// index
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    // returns an array
    res.render('campgrounds/index', {
        campgrounds
    });
}))

// create
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', validateCampground, catchAsync(async (req, res) => {
    // console.log(req.body);
    const {campground} = req.body;
    const camp = new Campground({
        title: campground.title,
        location: campground.location,
        image: campground.image,
        price: campground.price,
        description: campground.description,
    })
    await camp.save();

    res.redirect(`//${camp._id}`);
}))

//show
// TODO: Modal
router.get('/:id', catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', {camp});
}))

// edit
// ! no need to validate when someone is just visiting the edit page!
router.get('/:id/edit', catchAsync(async(req, res) => {
    console.log(1231231)
    const camp = await Campground.findById(req.params.id);
    console.log(camp)
    res.render('campgrounds/edit', {camp});
}))

router.put('/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    // spread the object (camground[title], campground[location])
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${camp._id}`);
}))

// delete
router.delete('/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

// ? review
router.post('/:id/reviews', validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    // review[rating] and review[body] given in the form
    const review = new Review(req.body.review);
    // campground model
    campground.reviews.push(review);

    await review.save();
    await campground.save();

    res.redirect(`/campgrounds/${campground._id}`);
}))

// ! delete a review
router.delete('/:id/reviews/:reviewId', catchAsync(async(req, res) => {
    const { id, reviewId } = req.params;
    // https://docs.mongodb.com/manual/reference/operator/update/pull/
    // update the campground by popping the related review
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    // then delete the review
    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;