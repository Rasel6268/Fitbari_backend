const express = require("express");
const settingController = require("./setting.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");
const { ROLES } = require("../../constants/roles");
const { updateSettingSchema } = require("./setting.validation");

const router = express.Router();

// ============================================================================
// PUBLIC ENDPOINT: Storefront & Admin can fetch active settings
// ============================================================================
router.get("/", settingController.getSettings);

// ============================================================================
// PROTECTED ENDPOINTS: Only authenticated Admins can modify settings
// ============================================================================
router.patch(
  "/",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
  validate(updateSettingSchema),
  settingController.updateSettings
);

router.put(
  "/",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
  validate(updateSettingSchema),
  settingController.updateSettings
);

router.post(
  "/reset",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  settingController.resetSettings
);

module.exports = router;
