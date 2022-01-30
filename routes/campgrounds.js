const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// utils, validation
const catchAsync = require('../utils/catchAsync');
const {ExpressError} = require('../utils/ExpressError');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')

// models, schemas
const Campground = require('../models/campground');
const Review = require('../models/review');
const campground = require('../models/campground');

// ! ROUTES
// index
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    // returns an array
    res.render('campgrounds/index', {campgrounds});
}))

// create
// ! isLoggedIn
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');  
})

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    // console.log(req.body);
    const campground = new Campground(req.body.campground);
    // adding an author to the campground
    campground.author = req.user._id;
    await campground.save();

    try{
        req.flash('success', 'Successfully created a new campground!')
    } catch (e){
        req.flash('error', `Something went wrong: ${e}`);
    }
    

    res.redirect(`/campgrounds/${campground._id}`);
}))

// show
router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    
    // ? https://stackoverflow.com/questions/17223517/mongoose-casterror-cast-to-objectid-failed-for-value-object-object-at-path
    // check if _id is valid
    if(mongoose.Types.ObjectId.isValid(req.params.id)){
        // populate reviews and author
        const camp = await Campground.findById(req.params.id).populate('reviews').populate('author');
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