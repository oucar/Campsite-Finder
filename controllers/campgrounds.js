const Campground = require('../models/campground');

// ! INDEX
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    // returns an array
    res.render('campgrounds/index', {campgrounds});
}

// ! NEW 
// displays the form
module.exports.newGet = (req, res) => {
    res.render('campgrounds/new')
}

// post the form
module.exports.newPost = async (req, res) => {
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
}
