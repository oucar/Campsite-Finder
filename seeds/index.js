const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
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

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});

    for(let i = 0; i < 100; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const randomPrice = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            author: '61f4ecb06e543e9c5bd80e12',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)}, ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dj0mmzypj/image/upload/v1644397740/Campsite-Finder/azf78j5htixa02joamck.jpg',
                    filename: 'Campsite-Finder/g9zmihmdhurrgqg7bmod',
                  },
                  {
                    url: 'https://res.cloudinary.com/dj0mmzypj/image/upload/v1644397740/Campsite-Finder/azf78j5htixa02joamck.jpg',
                    filename: 'Campsite-Finder/vgdamzabote3rayiitgn',
                  }
            ],
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fugit magni repudiandae voluptate ducimus. Laborum totam non quaerat! At blanditiis suscipit ad quae sed. Minima eos culpa quidem. Eveniet, nisi expedita?',
            price: randomPrice,
            geometry: {
                type: "Point",
                coordinates: [-113.1331, 47.0202]
            },
        });
        await camp.save();
    } // end for 
} // end seedDB();

// close the connection to the database
seedDB().then(() => {
    console.log("Database connection is closed!");
    mongoose.connection.close();
})