// Carried forward from Milestone Two (Software Design/Engineering enhancement)
// Centralizes environment config and shared asyncHandler utility.

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set. Refusing to start.');
}

// Wraps async route handlers to forward errors to Express errorHandler
// instead of leaving unhandled promise rejections.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  asyncHandler
};
