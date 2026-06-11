// app_api/config/index.js
//
// Centralized application configuration.
//
// Enhancement note (CS 499, Software Design and Engineering):
// During the code review, several values were hard coded directly in the
// source, including a JWT signing secret that fell back to a known string,
// a default image file name, and request whitelists scattered inside the
// controller. Hard coded values like these are a maintainability problem
// (the checklist item about using named constants instead of magic values)
// and the fallback secret was also a real security flaw. Pulling them into
// one config module gives the application a single source of truth and
// removes the insecure fallback.

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Fail loudly at startup if the secret is missing, instead of silently
// signing tokens with a known fallback value the way the original code did.
if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is not set. Create a .env file (see .env.example) and set ' +
    'JWT_SECRET before starting the server. The application will not run ' +
    'with an insecure default secret.'
  );
}

module.exports = {
  jwtSecret: JWT_SECRET,
  jwtExpiryDays: 7,

  // Fields a client is allowed to set on a trip. Anything else in the
  // request body is ignored, which prevents mass assignment of unexpected
  // fields into the document.
  tripWritableFields: [
    'code', 'name', 'length', 'start', 'resort',
    'perPerson', 'image', 'description'
  ],

  defaults: {
    tripImage: 'default.jpg'
  }
};
