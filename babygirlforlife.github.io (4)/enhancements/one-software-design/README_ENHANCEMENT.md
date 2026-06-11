# Travlr Getaways - CS 499 Enhancement One (Software Design and Engineering)

This is the Travlr Getaways MEAN stack application, enhanced for the software
design and engineering category of the CS 499 capstone. The original artifact
came from CS 465 Full Stack Development.

## What changed and why

Every change below maps to a finding from the Module 2 code review.

1. Removed duplicate and dead code (`app_api/controllers/trips.js`)
   The original controller contained two versions of the add and update
   operations (`tripsAddTrip` / `tripsAddTripV2` and `tripsUpdateTrip` /
   `tripsUpdateTripV2`), some exported but never wired into the routes, plus
   several scattered `module.exports` blocks. The controller now has exactly
   one implementation of each operation and a single export block.

2. Standardized style
   Every handler now uses `async`/`await` wrapped by a shared `asyncHandler`,
   replacing the original mix of `async`/`await` and `.then().catch()` chains.

3. Fixed a logic bug
   The original `tripsFind` used `Model.find()`, which returns an array, so its
   `if (!trips)` not-found check could never be true. It now uses `findOne()`
   and returns a proper 404 when no trip matches.

4. Safe, centralized error handling (`app_api/middleware/errorHandler.js`)
   The original sent the raw error object to the client with
   `res.status(500).send(err)`. A centralized error handler now maps known
   error types to the right status codes and returns clean JSON. Internal
   details are logged on the server only, never sent to the caller. Unmatched
   API routes return a clean JSON 404.

5. Removed magic values and the insecure secret fallback (`app_api/config/index.js`)
   The hard coded default image, the API URL on the Angular side, and the JWT
   secret were all hard coded. The JWT secret previously fell back to a known
   string (`travlr-secret-key`) if the environment variable was unset, which
   was a real security flaw. Configuration is now centralized, and the server
   refuses to start if `JWT_SECRET` is not set.

6. Reduced mass-assignment risk
   Create and update now write only a whitelisted set of fields
   (`config.tripWritableFields`) instead of passing the raw request body
   straight into the database.

## Folder layout

- `app_api/` ............ enhanced Express/Node API (controllers, routes, models, middleware, config)
- `app/` ................ Angular single page application (enhanced TripService + environment config)
- `app_server/` ......... server-rendered Handlebars views (unchanged)
- `_original_before_enhancement/` ... the original versions of the files that were changed, for before/after comparison

## Running locally

1. `npm install`
2. Copy `.env.example` to `.env` and set a strong `JWT_SECRET`
3. Start MongoDB, then `npm start`
4. In `app/`, run `npm install` then `ng serve` for the Angular front end
