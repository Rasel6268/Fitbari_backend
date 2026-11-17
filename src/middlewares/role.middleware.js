const ApiError = require("../utils/ApiError");

/**
 * Role-Based Access Control (RBAC) Guard
 * @param  {...string} allowedRoles - Permitted roles (e.g. ROLES.ADMIN, ROLES.MANAGER)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required before permission verification."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Permission denied: Role '${req.user.role}' cannot perform this action.`
        )
      );
    }

    next();
  };
};

module.exports = authorize;

