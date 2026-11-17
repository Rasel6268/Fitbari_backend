const express = require("express");
const authController = require("./auth.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");
const {
  registerSchema,
  adminRegisterSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require("./auth.validation");

const router = express.Router();

// Public Authentication endpoints
router.post("/register", validate(registerSchema), authController.register);
router.post("/admin/register", validate(adminRegisterSchema), authController.adminRegister);
router.post("/login", validate(loginSchema), authController.login);
router.post("/admin/login", validate(loginSchema), authController.adminLogin);
router.post("/logout", authController.logout);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

// Protected Authentication endpoints
router.get("/me", authenticate, authController.getMe);
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

module.exports = router;

