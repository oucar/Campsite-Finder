const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

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