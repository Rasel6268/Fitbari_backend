const jwt = require("jsonwebtoken");
const env = require("../config/env");

/**
 * Generate a signed JWT token
 * @param {object} payload - Token payload (e.g. { id, role })
 * @param {string} expiresIn - Optional expiration override
 */
const generateToken = (payload, expiresIn = env.jwt.expiresIn) => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn,
  });
};

/**
 * Verify a JWT token
 * @param {string} token
 */
const verifyToken = (token) => {
  return jwt.verify(token, env.jwt.secret);
};

module.exports = {
  generateToken,
  verifyToken,
};

