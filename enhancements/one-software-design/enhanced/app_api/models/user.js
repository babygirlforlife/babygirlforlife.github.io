// app_api/models/user.js
//
// Enhancement note (CS 499): the generateJwt method previously signed tokens
// with process.env.JWT_SECRET || 'travlr-secret-key'. The hard coded fallback
// was removed; the secret and expiry now come from the centralized config.
// Password hashing already used pbkdf2 with a per-user salt, which was kept.

const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  hash: String,
  salt: String
});

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
};

userSchema.methods.validPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateJwt = function () {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + config.jwtExpiryDays);
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      exp: parseInt(expiry.getTime() / 1000, 10)
    },
    config.jwtSecret
  );
};

module.exports = mongoose.model('users', userSchema);
