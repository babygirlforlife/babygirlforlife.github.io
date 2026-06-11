// ENHANCED — Milestone Four: Databases
// Changes from original:
//   1. tripsAddTrip and tripsUpdateTrip use explicit field whitelist (no mass-assignment)
//   2. tripsUpdateTrip uses $set with safe field list
//   3. New: tripsStats  — aggregation pipeline returning avg/min/max price and count
//   4. New: tripsUpcoming — aggregation pipeline returning upcoming trips sorted by date,
//          with a computed daysUntilDeparture field
//   5. asyncHandler imported from shared config (established in Milestone Two)

const Trip = require('../models/travlr');
const { asyncHandler } = require('../config');

// Whitelist of fields callers are allowed to write.
// Prevents extra fields in req.body from reaching the database.
const ALLOWED_FIELDS = [
  'code', 'name', 'length', 'start', 'resort', 'perPerson', 'image', 'description'
];

const pick = (obj, keys) =>
  keys.reduce((acc, k) => {
    if (obj[k] !== undefined) acc[k] = obj[k];
    return acc;
  }, {});

// ─── READ ────────────────────────────────────────────────────────────────────

// GET /api/trips
const tripsList = asyncHandler(async (req, res) => {
  const trips = await Trip.find({}).exec();
  if (!trips || trips.length === 0) {
    return res.status(404).json({ message: 'No trips found' });
  }
  return res.status(200).json(trips);
});

// GET /api/trips/:tripCode
const tripsFindCode = asyncHandler(async (req, res) => {
  const trip = await Trip.findOne({ code: req.params.tripCode }).exec();
  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }
  return res.status(200).json(trip);
});

// ─── WRITE ───────────────────────────────────────────────────────────────────

// POST /api/trips  (requires JWT auth + validateTrip middleware)
const tripsAddTrip = asyncHandler(async (req, res) => {
  // validateTrip has already coerced types; pick only allowed fields
  const data = pick(req.body, ALLOWED_FIELDS);
  const trip = await Trip.create(data);
  return res.status(201).json(trip);
});

// PUT /api/trips/:tripCode  (requires JWT auth + validateTrip middleware)
const tripsUpdateTrip = asyncHandler(async (req, res) => {
  const data = pick(req.body, ALLOWED_FIELDS);
  const trip = await Trip.findOneAndUpdate(
    { code: req.params.tripCode },
    { $set: data },           // $set prevents overwriting fields not in the request
    { new: true, runValidators: true }
  ).exec();
  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }
  return res.status(200).json(trip);
});

// ─── AGGREGATION ─────────────────────────────────────────────────────────────

// GET /api/trips/stats
// Returns per-resort pricing statistics and trip count.
// Demonstrates: $group stage, $avg / $min / $max accumulators, $sort.
// Only possible because perPerson is now stored as Number.
const tripsStats = asyncHandler(async (req, res) => {
  const stats = await Trip.aggregate([
    {
      $group: {
        _id: '$resort',
        tripCount:    { $sum: 1 },
        avgPrice:     { $avg: '$perPerson' },
        minPrice:     { $min: '$perPerson' },
        maxPrice:     { $max: '$perPerson' },
        avgNights:    { $avg: '$length' }
      }
    },
    {
      $project: {
        _id: 0,
        resort:    '$_id',
        tripCount: 1,
        avgPrice:  { $round: ['$avgPrice', 2] },
        minPrice:  1,
        maxPrice:  1,
        avgNights: { $round: ['$avgNights', 1] }
      }
    },
    { $sort: { avgPrice: 1 } }
  ]);

  if (!stats || stats.length === 0) {
    return res.status(404).json({ message: 'No trip data available for statistics' });
  }
  return res.status(200).json(stats);
});

// GET /api/trips/upcoming
// Returns trips that have not yet departed, sorted by departure date,
// with a daysUntilDeparture field computed inside the aggregation pipeline.
// Demonstrates: $match on a date field, $addFields with $dateDiff, $sort.
const tripsUpcoming = asyncHandler(async (req, res) => {
  const now = new Date();
  const upcoming = await Trip.aggregate([
    {
      $match: { start: { $gte: now } }
    },
    {
      $addFields: {
        daysUntilDeparture: {
          $dateDiff: {
            startDate: '$$NOW',
            endDate:   '$start',
            unit:      'day'
          }
        }
      }
    },
    { $sort: { start: 1 } },
    {
      $project: {
        _id: 0,
        code:                1,
        name:                1,
        resort:              1,
        start:               1,
        length:              1,
        perPerson:           1,
        daysUntilDeparture:  1
      }
    }
  ]);

  if (!upcoming || upcoming.length === 0) {
    return res.status(404).json({ message: 'No upcoming trips found' });
  }
  return res.status(200).json(upcoming);
});

module.exports = {
  tripsList,
  tripsFindCode,
  tripsAddTrip,
  tripsUpdateTrip,
  tripsStats,
  tripsUpcoming
};
