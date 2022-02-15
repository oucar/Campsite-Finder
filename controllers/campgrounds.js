const Campground = require('../models/campground');
const mongoose = require('mongoose');
const { cloudinary } = require('../cloudinary')

// mapbox
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

// ! INDEX
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({}).populate({
        path: 'reviews'
    });
    
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

    // geocoding
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
    }).send();
    // console.log(geoData.body.features[0].geometry);

    const campground = new Campground(req.body.campground);
    campground.geometry =  geoData.body.features[0].geometry;
    campground.author = req.user._id;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    await campground.save();
    
    try{
        req.flash('success', 'Successfully created a new campground!')
    } catch (e){
        req.flash('error', `Something went wrong: ${e}`);
    }

    console.log(campground)
    res.redirect(`/campgrounds/${campground._id}`);
}

// ! SHOW
// displays the campground
module.exports.showGet = async (req, res) => {
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
}

// ! EDIT
// no need to validate when someone is just visiting the edit page!
// user is not logged in, (prevent Postman submission and trying to access the page by typing the link)
// user onur cannot edit http://localhost:3000/campgrounds/61f4ed4eec97d227ef94b941
module.exports.editGet = async(req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);

    // cannot find the campground
    if(!camp){
        req.flash('error', 'Cannot find the campground! :(');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', {camp});
}

module.exports.editPut = async(req, res) => {
    const { id } = req.params;
    
    // spread the object (camground[title], campground[location])
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground});

    // we are pushing this time, so that we don't overwrite the existing images
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    camp.images.push(...imgs);

    // deleting an image (only if selected) 
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }

        // pull those images from `images` array
        await camp.updateOne({ $pull: { images: { filename: {$in: req.body.deleteImages }}}});
    }
    await camp.save();

    req.flash('success', 'Successfully updated a campground.');
    res.redirect(`/campgrounds/${camp._id}`);
}

// ! DELETE
module.exports.deleteDelete = async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id); 

    // flash message
    req.flash('success', 'Successfully deleted a campground.');

    res.redirect('/campgrounds');
}