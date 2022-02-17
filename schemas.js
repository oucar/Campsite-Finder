const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

// In order to prevent XSS attacks
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                // nothing is allowed here
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                // if there was a difference
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);


// JOI Schemas
module.exports.campgroundSchema = Joi.object({
    // campground[price], etc..
    campground : Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
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
        body:Joi.string().required().escapeHTML(),
    }).required()
})

