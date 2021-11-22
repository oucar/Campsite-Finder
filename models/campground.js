// DOCS: https://mongoosejs.com/docs/guide.html
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// TODO: DATE ADDED! --> https://momentjs.com/ 
const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
})

module.exports = mongoose.model('Campground', CampgroundSchema);