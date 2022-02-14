const Joi = require('joi');

// JOI Schemas

module.exports.campgroundSchema = Joi.object({
    // campground[price], etc..
    campground : Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
    }).required(),
    deleteImages: Joi.array(),
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        // even though we have validation in client-side,
        // it's a good idea to include this as well to prevent people from posting empty reviews
        // using postman etc.
        // ? min can be changed to 0?
        rating: Joi.number().required().min(1).max(5),
        body:Joi.string().required(),
    }).required()
})

