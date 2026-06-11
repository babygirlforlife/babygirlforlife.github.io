// app_api/middleware/errorHandler.js
//
// Enhancement note (CS 499, Software Design and Engineering):
// The original controller had no consistent error handling. Several catch
// blocks did res.status(500).send(err), which sent the raw error object
// straight back to the client. That is both a maintainability problem and a
// security problem, because internal details (stack traces, driver errors)
// should never be exposed to the caller. These helpers centralize error
// handling so every route fails the same, predictable, safe way.

// Wraps an async route handler so any rejected promise is forwarded to the
// Express error handler instead of crashing the process or being swallowed.
// This let me remove the repetitive try/catch blocks from every controller
// function and keep the controllers focused on their actual logic.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// 404 handler for unmatched API routes. Returns clean JSON instead of the
// HTML error page the original server-side handler produced.
const notFound = (req, res) => {
  res.status(404).json({ message: 'Resource not found' });
};

// Central error handler. Maps known error types to appropriate status codes
// and always returns a clean, consistent JSON message. The raw error is
// logged on the server for debugging but never sent to the client.
const errorHandler = (err, req, res, next) => {
  console.error(err); // server-side log only

  // Mongoose validation error -> 400 Bad Request
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation failed', details });
  }

  // Mongoose cast error (e.g. malformed id) -> 400 Bad Request
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid request parameter' });
  }

  // Duplicate key -> 409 Conflict
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Resource already exists' });
  }

  // Anything else -> 500, with a generic message (no internal details leaked)
  const status = err.status || 500;
  res.status(status).json({
    message: status === 500 ? 'An unexpected error occurred' : err.message
  });
};

module.exports = { asyncHandler, notFound, errorHandler };
