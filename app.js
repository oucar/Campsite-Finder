const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

// models
const Campground = require('./models/campground');

// mongoose
const mongoose = require('mongoose');
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

// ROUTES
app.get('/', (req, res) => {
    res.render('home.ejs');
})

// index
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    // returns an array
    res.render('campgrounds/index', {
        campgrounds
    });
})

// create
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', async (req, res) => {
    const {title, location} = req.body;
    const campground = new Campground({
        title: title,
        location: location,
    })
    await campground.save();

    res.redirect(`/campgrounds/${campground._id}`);
})

// show
app.get('/campgrounds/:id', async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {camp});
})

// edit
app.get('/campgrounds/:id/edit', async(req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {camp});
})

app.put('/campgrounds/:id', async(req, res) => {
    const { id } = req.params;
    // spread the object (camground[title], campground[location])
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${camp._id}`);
})

// delete
app.delete('/campgrounds/:id', async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

// TEST 
app.get('/makecampground', async (req, res) => {
    const camp = new Campground({
        title: 'deneme'
    });
    await camp.save();
    res.send(camp);
})

app.listen(3000, () => {
    console.log(`LIVE ON PORT 30000!`);
})