// ORIGINAL — before Milestone Four databases enhancement
const express = require('express');
const router = express.Router();
const { expressjwt: jwt } = require('express-jwt');
const { tripsList, tripsFindCode, tripsAddTrip, tripsUpdateTrip } = require('../controllers/trips');

const auth = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256']
});

router.get('/trips', tripsList);
router.get('/trips/:tripCode', tripsFindCode);
router.post('/trips', auth, tripsAddTrip);
router.put('/trips/:tripCode', auth, tripsUpdateTrip);

module.exports = router;
