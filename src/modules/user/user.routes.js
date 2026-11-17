const express = require("express");
const userController = require("./user.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const { ROLES } = require("../../constants/roles");
const { updateUserSchema, updateUserRoleSchema, queryUsersSchema } = require("./user.validation");

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Current user profile endpoints
router.get("/me", userController.getMyProfile);
router.patch("/me", validate(updateUserSchema), userController.updateMyProfile);

// Admin / Management endpoints
router.get(
  "/",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate({ query: queryUsersSchema }),
  userController.getAllUsers
);

router.get(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  userController.getUserById
);

router.patch(
  "/:id/role",
  authorize(ROLES.SUPER_ADMIN),
  validate(updateUserRoleSchema),
  userController.updateUserRole
);

router.patch(
  "/:id/status",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  userController.toggleUserStatus
);

module.exports = router;

