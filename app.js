const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');

// Models
const Campground = require('./models/campground');
const Review = require('./models/review');

// mongoose
const mongoose = require('mongoose');
const { exists } = require('./models/campground');
mongoose.connect('mongodb://localhost:27017/campgrounds', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Routes
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews')

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

// serving static assets
// path.join, _dirname!
app.use(express.static(path.join(__dirname, 'public')));

// session
const sessionConfig = {
    secret: 'better!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        // in ms
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        // cannot be accessed through client side scripts
        httpOnly: true,
    }
    // store: mongo,
}

// Sessions
app.use(session(sessionConfig));
app.use(flash());

// Passport
// ! Passport should come after Sessions!
app.use(passport.initialize());
app.use(passport.session());


// in every request we will have access to success flash under the key success in locals
app.use((req, res, next) => {
    // all success, errors and other possible flash messages from cookies
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// ! ROUTES
// campground routes
app.use('/campgrounds', campgrounds);
// review routes
app.use('/campgrounds/:id/reviews', reviews);


app.get('/', (req, res) => {
    res.render('home.ejs');
})


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