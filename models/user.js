const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    // email
    email: {
        type: String,
        required: true,
    }
});

// will add on our schema the username and password
// makes sure that usernames are unique and passwords are strong enough etc
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);

