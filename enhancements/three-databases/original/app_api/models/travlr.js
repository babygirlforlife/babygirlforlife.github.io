// ORIGINAL — before Milestone Four databases enhancement
const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  code:        { type: String, required: true, index: true },
  name:        { type: String, required: true, index: true },
  length:      { type: String, required: true },        // BUG: should be Number
  start:       { type: Date,   required: true },
  resort:      { type: String, required: true },
  perPerson:   { type: String, required: true },        // BUG: should be Number
  image:       { type: String, required: true },
  description: { type: String, required: true }
});

const Trip = mongoose.model('trips', tripSchema);
module.exports = Trip;
