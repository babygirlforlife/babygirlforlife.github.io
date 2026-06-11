// app_api/middleware/auth.js
//
// Enhancement note (CS 499): the original verified tokens with
// process.env.JWT_SECRET || 'travlr-secret-key'. That fallback meant the API
// would happily accept tokens signed with a publicly known key if the
// environment variable was missing. The secret now comes only from the
// centralized config, which throws at startup if it is not set.

const jwt = require('jsonwebtoken');
const config = require('../config');

const auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.auth = jwt.verify(token, config.jwtSecret);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = auth;
