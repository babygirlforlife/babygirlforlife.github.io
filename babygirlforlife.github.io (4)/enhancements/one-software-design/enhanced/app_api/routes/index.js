// app_api/routes/index.js
//
// API routes for Travlr Getaways.
//
// Enhancement note (CS 499): GET routes are public; create, update, and delete
// require a valid JWT (the auth middleware). The controller now exposes exactly
// one handler per operation, so the route table is clean and unambiguous.

const express = require('express');
const router = express.Router();
const tripsController = require('../controllers/trips');
const authController = require('../controllers/authentication');
const auth = require('../middleware/auth');

// Auth routes (public)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Trip routes - reads are public, writes require authentication
router.get('/trips', tripsController.tripsList);
router.get('/trips/:tripCode', tripsController.tripsFind);
router.post('/trips', auth, tripsController.tripsAddTrip);
router.put('/trips/:tripCode', auth, tripsController.tripsUpdateTrip);
router.delete('/trips/:tripCode', auth, tripsController.tripsDeleteTrip);

module.exports = router;
