const catchAsync = require("../../utils/catchAsync");
const ApiResponse = require("../../utils/ApiResponse");
const authService = require("./auth.service");

/**
 * Register account (admin/staff or optional customer)
 */
const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  return ApiResponse.created(res, "Account registered successfully", result);
});

/**
 * Login with email and password
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return ApiResponse.success(res, "Logged in successfully", result);
});

/**
 * Admin Portal Register (Creates administrative account & returns JWT)
 */
const adminRegister = catchAsync(async (req, res) => {
  const result = await authService.adminRegister(req.body);
  return ApiResponse.created(res, "Administrator registered and authenticated successfully", result);
});

/**
 * Admin Portal Login (Enforces admin role)
 */
const adminLogin = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.adminLogin(email, password);
  return ApiResponse.success(res, "Administrator authenticated successfully", result);
});

/**
 * Get current authenticated user profile
 */
const getMe = catchAsync(async (req, res) => {
  return ApiResponse.success(res, "Session profile retrieved", req.user);
});

/**
 * Request password reset email
 */
const forgotPassword = catchAsync(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  return ApiResponse.success(res, result.message);
});

/**
 * Complete password reset with token
 */
const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;
  const result = await authService.resetPassword(token, newPassword);
  return ApiResponse.success(res, result.message);
});

/**
 * Change password while authenticated
 */
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
  return ApiResponse.success(res, result.message);
});

/**
 * Logout
 */
const logout = catchAsync(async (req, res) => {
  return ApiResponse.success(res, "Logged out successfully");
});

module.exports = {
  register,
  adminRegister,
  login,
  adminLogin,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
};

