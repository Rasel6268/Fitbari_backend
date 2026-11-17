/**
 * Standardized Operational API Error
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(msg = "Bad Request") {
    return new ApiError(400, msg);
  }

  static unauthorized(msg = "Unauthorized Access") {
    return new ApiError(401, msg);
  }

  static forbidden(msg = "Forbidden: Insufficient Permissions") {
    return new ApiError(403, msg);
  }

  static notFound(msg = "Resource Not Found") {
    return new ApiError(404, msg);
  }

  static conflict(msg = "Resource Conflict") {
    return new ApiError(409, msg);
  }

  static internal(msg = "Internal Server Error") {
    return new ApiError(500, msg, false);
  }
}

module.exports = ApiError;

