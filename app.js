// DOTENV
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ExpressError = require('./utils/ExpressError');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

// Models
const Campground = require('./models/campground');
const Review = require('./models/review');
const User = require('./models/user');

// mongoose
const mongoose = require('mongoose');
const {
    exists
} = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/campgrounds', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Routes
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

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
    name: '__iLoveLegos!',
    secret: 'better!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        // in ms
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        // cannot be accessed through client side scripts
        httpOnly: true,
        // only works in https!! - for deployment only
        // secure: true,
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
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// mongo sanitize
app.use(mongoSanitize());

//  helmet
// app.use(
//     helmet({
//         crossOriginEmbedderPolicy: false,
//         // ...
//     })
// );


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/ajax/",
    "https://cdn.jsdelivr.net",
    "https://code.jquery.com",
    "https://ajax.googleapis.com/ajax/",

];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",


];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    "https://cdnjs.cloudflare.com/ajax/",
    "https://thumbs.gfycat.com/"

];
app.use(
    helmet({
        crossOriginEmbedderPolicy: false,
        // ...
    }),
    
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["http://localhost:3000/", "https://thumbs.gfycat.com/"],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    }),

);



// middleware
// ! in every request we will have access to success flash under the key success in locals
app.use((req, res, next) => {

    // ? check returnTo! -> returning back to the page if not logged in
    // console.log(req.session);

    // ! we will have access to currentUser in all templates
    res.locals.currentUser = req.user;

    // express-mongo-sanitize
    // ? '?$gt': 'lorem ipsum' ? will be prevented with the help of this package
    console.log(req.query);

    // all success, errors and other possible flash messages from cookies
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// ! ROUTES
// campground routes
app.use('/campgrounds', campgroundRoutes);
// review routes
app.use('/campgrounds/:id/reviews', reviewRoutes);
// users (login and register) routes (no need to prefix)
app.use('/', userRoutes);


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
    const {
        statusCode = 500
    } = err;
    if (!err.message) err.message = 'Something went wrong.';
    res.render('error.ejs', {
        err
    });
    // res.send(`${message} - ERROR CODE: ${statusCode}`);
})

app.listen(3000, () => {
    console.log(`LIVE ON PORT 30000!`);
})