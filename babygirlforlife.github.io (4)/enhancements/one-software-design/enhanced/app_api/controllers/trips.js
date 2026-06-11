// app_api/controllers/trips.js
//
// Trip controller for the Travlr Getaways API.
//
// Enhancement summary (CS 499, Software Design and Engineering):
//   1. Consolidated duplicate code. The original file had two versions of the
//      add and update operations (tripsAddTrip / tripsAddTripV2 and
//      tripsUpdateTrip / tripsUpdateTripV2), several of which were exported
//      but never routed. All dead and duplicate functions were removed, so
//      there is now exactly one implementation of each operation and a single
//      module.exports block at the bottom.
//   2. Standardized style. Every handler now uses async/await wrapped by a
//      shared asyncHandler, replacing the mix of async/await and .then().catch()
//      chains that were in the original.
//   3. Fixed a logic bug. The original tripsFind used Model.find(), which
//      returns an array, so its "if (!trips)" not-found check could never be
//      true. It now uses findOne() and returns a proper 404 when no trip matches.
//   4. Safe error handling. No handler sends the raw error object to the client
//      anymore; errors are forwarded to the centralized error handler.
//   5. Removed magic values and mass-assignment risk. The default image and the
//      list of writable fields now come from config, and only whitelisted
//      fields are written to the database.

const Trip = require('../models/travlr');
const config = require('../config');
const { asyncHandler } = require('../middleware/errorHandler');

// Build a clean trip payload from the request body using only the fields a
// client is allowed to set. Anything else in the body is ignored.
const buildTripPayload = (body) => {
  const payload = {};
  config.tripWritableFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });
  return payload;
};

// GET /api/trips  -> list all trips
const tripsList = asyncHandler(async (req, res) => {
  const trips = await Trip.find({}).exec();
  return res.status(200).json(trips);
});

// GET /api/trips/:tripCode  -> find a single trip by code
const tripsFind = asyncHandler(async (req, res) => {
  // Use findOne (not find) so we get a single document or null, which makes
  // the not-found check below actually work.
  const trip = await Trip.findOne({ code: req.params.tripCode }).exec();
  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }
  return res.status(200).json(trip);
});

// POST /api/trips  -> create a trip (auth required)
const tripsAddTrip = asyncHandler(async (req, res) => {
  const payload = buildTripPayload(req.body);

  // Apply the default image only when one was not supplied.
  if (!payload.image) {
    payload.image = config.defaults.tripImage;
  }

  // Schema-level validation (required fields, types) is enforced by Mongoose
  // and surfaced through the centralized error handler as a 400.
  const trip = await Trip.create(payload);
  return res.status(201).json(trip);
});

// PUT /api/trips/:tripCode  -> update a trip (auth required)
const tripsUpdateTrip = asyncHandler(async (req, res) => {
  const payload = buildTripPayload(req.body);

  const trip = await Trip.findOneAndUpdate(
    { code: req.params.tripCode },
    payload,
    { new: true, runValidators: true } // return updated doc, validate the update
  ).exec();

  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }
  return res.status(200).json(trip);
});

// DELETE /api/trips/:tripCode  -> delete a trip (auth required)
const tripsDeleteTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOneAndDelete({ code: req.params.tripCode }).exec();
  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }
  return res.status(204).send();
});

// Single, consolidated export block.
module.exports = {
  tripsList,
  tripsFind,
  tripsAddTrip,
  tripsUpdateTrip,
  tripsDeleteTrip
};
