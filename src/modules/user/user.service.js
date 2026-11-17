const User = require("./user.model");
const ApiError = require("../../utils/ApiError");
const { getPaginationOptions, getPaginationMeta } = require("../../helpers/pagination");

/**
 * Get paginated users list (Admin only)
 */
const getAllUsers = async (query) => {
  const { page, limit, skip, sort } = getPaginationOptions(query);

  const filter = {};
  if (query.role) {
    filter.role = query.role;
  }
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
      { phone: { $regex: query.search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).select("-password").sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  const meta = getPaginationMeta(total, page, limit);

  return { users, meta };
};

/**
 * Get user by ID
 */
const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return user;
};

/**
 * Update user profile
 */
const updateUser = async (id, updateData) => {
  // Prevent role or password changes via generic profile update
  delete updateData.role;
  delete updateData.password;

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return user;
};

/**
 * Update user role (Admin only)
 */
const updateUserRole = async (id, role) => {
  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return user;
};

/**
 * Toggle user active status (Admin only)
 */
const toggleUserStatus = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  user.isActive = !user.isActive;
  await user.save();

  return { id: user._id, isActive: user.isActive };
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  toggleUserStatus,
};

