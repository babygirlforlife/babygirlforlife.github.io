// ORIGINAL — before Milestone Four databases enhancement
const Trip = require('../models/travlr');

// GET all trips
const tripsList = async (req, res) => {
  try {
    const trips = await Trip.find({}).exec();
    if (!trips || trips.length === 0) {
      return res.status(404).json({ message: 'No trips found' });
    }
    return res.status(200).json(trips);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET single trip by tripCode
const tripsFindCode = async (req, res) => {
  try {
    const trip = await Trip.findOne({ code: req.params.tripCode }).exec();
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    return res.status(200).json(trip);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST new trip — no validation
const tripsAddTrip = async (req, res) => {
  try {
    const trip = await Trip.create({
      code:        req.body.code,
      name:        req.body.name,
      length:      req.body.length,
      start:       req.body.start,
      resort:      req.body.resort,
      perPerson:   req.body.perPerson,
      image:       req.body.image,
      description: req.body.description
    });
    return res.status(201).json(trip);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// PUT update trip — no validation
const tripsUpdateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { code: req.params.tripCode },
      req.body,               // mass-assignment risk
      { new: true }
    ).exec();
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    return res.status(200).json(trip);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { tripsList, tripsFindCode, tripsAddTrip, tripsUpdateTrip };
