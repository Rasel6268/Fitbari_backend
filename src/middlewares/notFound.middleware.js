const ApiError = require("../utils/ApiError");

/**
 * 404 Not Found Middleware for unmapped routes
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Endpoint '${req.originalUrl}' does not exist on this server.`));
};

module.exports = notFoundHandler;

