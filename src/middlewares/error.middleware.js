const env = require("../config/env");

/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message = "Internal Server Error" } = err;

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value: An entry with this ${field} already exists.`;
  }

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Handle Mongoose CastError (Invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid format for parameter: ${err.path}`;
  }

  // Handle JWT Error
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token signature.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired. Please sign in again.";
  }

  const response = {
    success: false,
    statusCode,
    message,
    ...(env.nodeEnv === "development" && { stack: err.stack }),
  };

  if (statusCode === 500 && env.isProduction) {
    console.error(`[Unhandled Error]`, err);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;

