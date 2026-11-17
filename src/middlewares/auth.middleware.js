const ApiError = require("../utils/ApiError");
const { verifyToken } = require("../utils/generateToken");
const User = require("../modules/user/user.model");

/**
 * Mandatory Authentication Middleware
 * Requires a valid JWT token in Authorization: Bearer <token>
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(ApiError.unauthorized("Authentication required. Please provide a valid Bearer token."));
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return next(ApiError.unauthorized("Authentication token missing."));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return next(ApiError.unauthorized("Invalid or expired authentication token."));
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(ApiError.unauthorized("The account belonging to this token no longer exists."));
    }

    if (!user.isActive) {
      return next(ApiError.forbidden("This account has been deactivated."));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication Middleware
 * In Fit Bari, shoppers do NOT need to register to view products or checkout.
 * If a token is provided, attaches the user; otherwise proceeds gracefully as guest.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select("-password");
      req.user = user || null;
    } catch {
      req.user = null;
    }

    next();
  } catch {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};

