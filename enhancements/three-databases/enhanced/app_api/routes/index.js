// ENHANCED — Milestone Four: Databases
// Changes from original:
//   1. validateTrip middleware added to POST and PUT write routes
//   2. Two new aggregation-only GET routes: /trips/stats and /trips/upcoming
//      (public read — no JWT required for statistics endpoints)
//   3. Aggregation routes declared before /:tripCode to prevent param capture

const express = require('express');
const router = express.Router();
const { expressjwt: jwt } = require('express-jwt');

const {
  tripsList,
  tripsFindCode,
  tripsAddTrip,
  tripsUpdateTrip,
  tripsStats,
  tripsUpcoming
} = require('../controllers/trips');

const { validateTrip } = require('../middleware/validateTrip');

// JWT auth middleware — reads secret from environment (no hardcoded fallback)
const auth = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256']
});

// ─── AGGREGATION (declare before /:tripCode so Express does not capture 'stats') ──
router.get('/trips/stats',    tripsStats);
router.get('/trips/upcoming', tripsUpcoming);

// ─── STANDARD CRUD ────────────────────────────────────────────────────────────
router.get('/trips',                       tripsList);
router.get('/trips/:tripCode',             tripsFindCode);
router.post('/trips',    auth, validateTrip, tripsAddTrip);
router.put('/trips/:tripCode', auth, validateTrip, tripsUpdateTrip);

module.exports = router;
