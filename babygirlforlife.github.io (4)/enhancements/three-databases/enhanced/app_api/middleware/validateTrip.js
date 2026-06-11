// ENHANCED — Milestone Four: Databases
// validateTrip.js — input validation and sanitization middleware
// Applied to POST /api/trips and PUT /api/trips/:tripCode
//
// Validates required fields, correct types, and safe ranges
// before the request ever reaches the controller or the database.
// Returns 422 Unprocessable Entity with a structured error list
// so the Angular front end can display field-level feedback.

const validateTrip = (req, res, next) => {
  const errors = [];
  const body = req.body;

  // --- Required string fields ---
  const requiredStrings = ['code', 'name', 'resort', 'image', 'description'];
  for (const field of requiredStrings) {
    const val = body[field];
    if (val === undefined || val === null || String(val).trim() === '') {
      errors.push({ field, message: `${field} is required and cannot be blank` });
    } else {
      // Sanitize: trim whitespace, store back on body
      body[field] = String(val).trim();
    }
  }

  // --- length: must be a positive integer ---
  const rawLength = body.length;
  if (rawLength === undefined || rawLength === null || rawLength === '') {
    errors.push({ field: 'length', message: 'length (number of nights) is required' });
  } else {
    const parsed = Number(rawLength);
    if (!Number.isFinite(parsed) || parsed < 1 || !Number.isInteger(parsed)) {
      errors.push({ field: 'length', message: 'length must be a positive whole number' });
    } else {
      body.length = parsed;
    }
  }

  // --- perPerson: must be a non-negative number ---
  const rawPrice = body.perPerson;
  if (rawPrice === undefined || rawPrice === null || rawPrice === '') {
    errors.push({ field: 'perPerson', message: 'perPerson price is required' });
  } else {
    const parsed = Number(rawPrice);
    if (!Number.isFinite(parsed) || parsed < 0) {
      errors.push({ field: 'perPerson', message: 'perPerson must be a non-negative number' });
    } else {
      body.perPerson = parsed;
    }
  }

  // --- start: must be a parseable date ---
  const rawStart = body.start;
  if (rawStart === undefined || rawStart === null || rawStart === '') {
    errors.push({ field: 'start', message: 'start date is required' });
  } else {
    const d = new Date(rawStart);
    if (isNaN(d.getTime())) {
      errors.push({ field: 'start', message: 'start must be a valid date (ISO 8601 or similar)' });
    } else {
      body.start = d;
    }
  }

  if (errors.length > 0) {
    return res.status(422).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = { validateTrip };
