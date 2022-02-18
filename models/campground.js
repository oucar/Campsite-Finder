// DOCS: https://mongoosejs.com/docs/guide.html
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const ImageSchema = new Schema({
    url: String,
    filename: String,
})

// ? no need to store these in database, that's why it's called virtual property
// ? will be called everytime we call 'thumbnail'!
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

// required for using virtuals in json
const opts = { toJSON: { virtuals: true } };

// TODO: DATE ADDED! --> https://momentjs.com/ 
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required:true,
        },
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        }
    ]
}, opts)

// ? virtual property for the mapbox cluster map
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});



// Middleware for deleting a campground!
// we used "await Campground.findByIdAndDelete(id);" in app.js
// findByIdAndDelete invokes findOneAndDelete.
CampgroundSchema.post('findOneAndDelete', async function(deleted) {
    console.log(deleted);

    if(deleted){
        await Review.deleteMany({
            // where _id is in deleted object that has been passed in.
            _id: {
                $in: deleted.reviews,
            }
        })
    } else{
        console.log("Nothing to delete in the campground.");
    } // end if else
})

CampgroundSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Campground', CampgroundSchema);