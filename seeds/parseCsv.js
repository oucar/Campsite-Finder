const data = require('./campgroundData.json');

const mongoose = require('mongoose');
const Campground = require('../models/campground');


mongoose.connect('mongodb://localhost:27017/campgrounds', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected!");
});


const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < data.length; i++) {

        let obj = data[i];
        console.log(`${i}/${data.length}`);


        const camp = new Campground({
            author: '61f4ecb06e543e9c5bd80e12',
            location: obj['City'] + ", " + obj['State'],
            title: obj['Name'] + ", " +obj['State'],
            images: [{
                    url: 'https://res.cloudinary.com/dj0mmzypj/image/upload/v1644397740/Campsite-Finder/azf78j5htixa02joamck.jpg',
                    filename: 'Campsite-Finder/g9zmihmdhurrgqg7bmod',
                },
                {
                    url: 'https://res.cloudinary.com/dj0mmzypj/image/upload/v1644397740/Campsite-Finder/azf78j5htixa02joamck.jpg',
                    filename: 'Campsite-Finder/vgdamzabote3rayiitgn',
                }
            ],
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fugit magni repudiandae voluptate ducimus. Laborum totam non quaerat! At blanditiis suscipit ad quae sed. Minima eos culpa quidem. Eveniet, nisi expedita?',
            price: 0,
            geometry: {
                type: "Point",
                // latitude, longitude
                coordinates: [obj['Longitude'], obj['Latitude']]
            },
        });
        await camp.save();

    }
} // end seedDB();

// close the connection to the database
seedDB().then(() => {
    console.log("Database connection is closed!");
    mongoose.connection.close();
})