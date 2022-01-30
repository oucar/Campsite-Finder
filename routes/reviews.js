const express = require('express');
// route given in app.js has parameters.
// we would get "cannot read property reviews of null" error if we don't include mergeParams: true
const router = express.Router( { mergeParams:true });

// utils, validation, controller
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const reviewController = require('../controllers/reviews');

// models, schemas
const Campground = require('../models/campground');
const Review = require('../models/review');
const {reviewSchema} = require('../schemas');

// ! Routes
router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.post));
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.delete));

module.exports = router;