const express = require('express');
const router = express.Router();

// utils, validation
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

// models, schemas
const Campground = require('../models/campground');
const Review = require('../models/review');
const {campgroundSchema} = require('../schemas');


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
    const campground = new Campground(req.body.campground);
    await campground.save();

    // ! TODO: Implement try catch
    req.flash('success', 'Successfully created a new campground!')

    res.redirect(`/campgrounds/${campground._id}`);
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

module.exports = router;