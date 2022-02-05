const express = require('express');
const router = express.Router();

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
// ? We can also use route.route !

// ! INDEX
router.get('/', catchAsync(campgroundController.index));

// ! NEW
router.get('/new', isLoggedIn, campgroundController.newGet);
router.post('/', isLoggedIn, validateCampground, catchAsync(campgroundController.newPost));

// ! SHOW
router.get('/:id', catchAsync(campgroundController.showGet));

// ! EDIT
// ! no need to validate when someone is just visiting the edit page!
// user is not logged in, (prevent Postman submission and trying to access the page by typing the link)
// user onur cannot edit http://localhost:3000/campgrounds/61f4ed4eec97d227ef94b941
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgroundController.editGet));
router.put('/:id', isLoggedIn, isAuthor, catchAsync(campgroundController.editPut));

// ! DELETE
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgroundController.deleteDelete));

module.exports = router;