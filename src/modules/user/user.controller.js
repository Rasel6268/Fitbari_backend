const catchAsync = require("../../utils/catchAsync");
const ApiResponse = require("../../utils/ApiResponse");
const userService = require("./user.service");

/**
 * Get current authenticated user profile
 */
const getMyProfile = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  return ApiResponse.success(res, "Profile retrieved successfully", user);
});

/**
 * Update current user profile
 */
const updateMyProfile = catchAsync(async (req, res) => {
  const user = await userService.updateUser(req.user._id, req.body);
  return ApiResponse.success(res, "Profile updated successfully", user);
});

/**
 * Get all users with filters (Admin only)
 */
const getAllUsers = catchAsync(async (req, res) => {
  const { users, meta } = await userService.getAllUsers(req.query);
  return ApiResponse.success(res, "Users retrieved successfully", users, meta);
});

/**
 * Get single user by ID (Admin only)
 */
const getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return ApiResponse.success(res, "User retrieved successfully", user);
});

/**
 * Update user role (Super Admin/Admin only)
 */
const updateUserRole = catchAsync(async (req, res) => {
  const user = await userService.updateUserRole(req.params.id, req.body.role);
  return ApiResponse.success(res, "User role updated successfully", user);
});

/**
 * Toggle user active status (Admin only)
 */
const toggleUserStatus = catchAsync(async (req, res) => {
  const result = await userService.toggleUserStatus(req.params.id);
  return ApiResponse.success(res, "User status updated successfully", result);
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
};

