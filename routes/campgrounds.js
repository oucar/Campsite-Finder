const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// utils, validation
const catchAsync = require('../utils/catchAsync');
const {ExpressError} = require('../utils/ExpressError');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')

// models, schemas, controller
const {campgroundSchema} = require('../schemas');
const Campground = require('../models/campground');
const Review = require('../models/review');
const campground = require('../models/campground');
const campgroundController = require('../controllers/campgrounds');

// ! #### ROUTES #### 

// ! INDEX
router.get('/', catchAsync(campgroundController.index));

// ! NEW
router.get('/new', isLoggedIn, campgroundController.newGet);
router.post('/', isLoggedIn, validateCampground, catchAsync(campgroundController.newPost));

// show
router.get('/:id', catchAsync(async (req, res) => {
    // ? https://stackoverflow.com/questions/17223517/mongoose-casterror-cast-to-objectid-failed-for-value-object-object-at-path
    // check if _id is valid
    if(mongoose.Types.ObjectId.isValid(req.params.id)){
        // populate reviews and author
        const camp = await Campground.findById(req.params.id).populate({
            // ! we also need to populate each review's author! - nested populate
            path: 'reviews', 
            populate: {
                path: 'author'
            }
        }).populate('author');
        console.log(camp);
        res.render('campgrounds/show', {camp});
    } else {
        req.flash('error', 'This campground might be deleted, or who knows, it may have never existed (just like you).');
        return res.redirect('/campgrounds')
    }
    
}))

// edit
// ! no need to validate when someone is just visiting the edit page!
// user is not logged in, (prevent Postman submission and trying to access the page by typing the link)
// user onur cannot edit http://localhost:3000/campgrounds/61f4ed4eec97d227ef94b941
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async(req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);

    // cannot find the campground
    if(!camp){
        req.flash('error', 'Cannot find the campground! :(');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', {camp});
}))

router.put('/:id', isLoggedIn, isAuthor, catchAsync(async(req, res) => {
    const { id } = req.params;
    
    // spread the object (camground[title], campground[location])
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated a campground.');
    res.redirect(`/campgrounds/${camp._id}`);
}))

// delete
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id); 

    // flash message
    req.flash('success', 'Successfully deleted a campground.');

    res.redirect('/campgrounds');
}))

module.exports = router;