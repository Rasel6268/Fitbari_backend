const ApiError = require("../utils/ApiError");

/**
 * Zod Request Validation Middleware
 * Validates req.body, req.query, or req.params against provided schema
 */
const validate = (schema) => (req, res, next) => {
  try {
    const dataToValidate = {};
    if (schema.body) dataToValidate.body = req.body;
    if (schema.query) dataToValidate.query = req.query;
    if (schema.params) dataToValidate.params = req.params;

    if (schema.parse) {
      // Direct schema passed for body
      req.body = schema.parse(req.body);
    } else {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.query) req.query = schema.query.parse(req.query);
      if (schema.params) req.params = schema.params.parse(req.params);
    }

    next();
  } catch (error) {
    if (error.errors && Array.isArray(error.errors)) {
      const formattedErrors = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");
      return next(ApiError.badRequest(`Validation error: ${formattedErrors}`));
    }
    next(ApiError.badRequest(error.message || "Invalid request payload"));
  }
};

module.exports = validate;

