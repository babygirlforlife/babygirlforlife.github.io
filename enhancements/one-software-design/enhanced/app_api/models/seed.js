const mongoose = require('mongoose');
const Trip = require('./travlr');
const fs = require('fs');

const trips = JSON.parse(fs.readFileSync('./data/trips.json', 'utf8'));
const dbURI = 'mongodb://127.0.0.1/travlr';

mongoose.connect(dbURI, {})
    .then(() => {
        console.log('Connected to MongoDB');
        return Trip.deleteMany({});
    })
    .then(() => {
        console.log('Existing trips removed');
        return Trip.insertMany(trips);
    })
    .then(() => {
        console.log(`${trips.length} trips inserted`);
        mongoose.connection.close();
    })
    .catch(err => {
        console.log('Error:', err);
        mongoose.connection.close();
    });