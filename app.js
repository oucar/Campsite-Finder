const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

// validation
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./schemas');

// models
const Campground = require('./models/campground');
const Review = require('./models/review')

// mongoose
const mongoose = require('mongoose');
const { exists } = require('./models/campground');
mongoose.connect('mongodb://localhost:27017/campgrounds', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error - CONNECTING THE DATABASE: "));
db.once("open", () => {
    console.log("Database is connected!");
})

// ejs
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({
    extended: true
}))
app.use(methodOverride('_method'));

// Server Side Error Handling Middleware
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

// Review Validation
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

// ROUTES
app.get('/', (req, res) => {
    res.render('home.ejs');
})

// index
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    // returns an array
    res.render('campgrounds/index', {
        campgrounds
    });
}))

// create
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
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

    res.redirect(`/campgrounds/${camp._id}`);
}))

//show
// TODO: Modal
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', {camp});
}))

// edit
// ! no need to validate when someone is just visiting the edit page!
app.get('/campgrounds/:id/edit', catchAsync(async(req, res) => {
    console.log(1231231)
    const camp = await Campground.findById(req.params.id);
    console.log(camp)
    res.render('campgrounds/edit', {camp});
}))

app.put('/campgrounds/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    // spread the object (camground[title], campground[location])
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${camp._id}`);
}))

// delete
app.delete('/campgrounds/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

// ? review
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    // review[rating] and review[body] given in the form
    const review = new Review(req.body.review);
    // campground model
    campground.reviews.push(review);

    await review.save();
    await campground.save();

    res.redirect(`/campgrounds/${campground._id}`);
}))

// TEST 
app.get('/makecampground', catchAsync(async (req, res) => {
    const camp = new Campground({
        title: 'deneme'
    });
    await camp.save();
    res.send(camp);
}))

// ! If nothing else is matched 
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

// ! Generic Error Handler
// if page does not exist, next() will hit this error handler
app.use((err, req, res, next) => {
    const {statusCode = 500 } = err;
    if(!err.message) err.message = 'Something went wrong.';
    res.render('error.ejs', {err});
    // res.send(`${message} - ERROR CODE: ${statusCode}`);
})

app.listen(3000, () => {
    console.log(`LIVE ON PORT 30000!`);
})