const crypto = require("crypto");
const User = require("../user/user.model");
const ApiError = require("../../utils/ApiError");
const { hashPassword, comparePassword } = require("../../helpers/password");
const { generateToken } = require("../../utils/generateToken");
const sendEmail = require("../../utils/sendEmail");
const { ROLES } = require("../../constants/roles");

/**
 * Register Administrator / Staff Account
 * NOTE: Customers never need to authenticate or create accounts.
 */
const register = async (userData) => {
  return adminRegister(userData);
};

/**
 * Login user with email & password
 */
const login = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password credentials.");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("This account has been deactivated. Please contact support.");
  }

  const isPasswordMatch = await comparePassword(password, user.password);
  if (!isPasswordMatch) {
    throw ApiError.unauthorized("Invalid email or password credentials.");
  }

  // Update last login timestamp
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken({ id: user._id, role: user.role });

  const sanitizedUser = await User.findById(user._id).select("-password");

  return { user: sanitizedUser, token };
};

/**
 * Admin Portal Registration - Registers an administrator or staff member
 * NOTE: Shoppers never need to register or create accounts.
 */
const adminRegister = async (adminData) => {
  const existingUser = await User.findOne({ email: adminData.email.toLowerCase() });
  if (existingUser) {
    throw ApiError.conflict("An administrative account with this email address already exists.");
  }

  // Count existing admins
  const adminCount = await User.countDocuments({
    role: { $in: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] },
  });

  // The first administrator created receives SUPER_ADMIN
  let assignedRole = ROLES.SUPER_ADMIN;
  if (adminCount > 0) {
    const requested = adminData.role?.toUpperCase();
    if (requested && [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN].includes(requested)) {
      assignedRole = requested;
    } else {
      assignedRole = ROLES.ADMIN;
    }
  }

  const hashedPassword = await hashPassword(adminData.password);

  const newAdmin = await User.create({
    name: adminData.name,
    email: adminData.email.toLowerCase(),
    phone: adminData.phone || "",
    password: hashedPassword,
    role: assignedRole,
    isActive: true,
  });

  const token = generateToken({ id: newAdmin._id, role: newAdmin.role });
  const sanitizedAdmin = await User.findById(newAdmin._id).select("-password");

  return { user: sanitizedAdmin, token };
};

/**
 * Admin Portal Login - Verifies credentials and enforces administrative role access
 */
const adminLogin = async (email, password) => {
  const result = await login(email, password);
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER];

  if (!allowedRoles.includes(result.user.role)) {
    throw ApiError.forbidden("Access denied: Only administrators and staff members can access the Admin Portal.");
  }

  return result;
};

/**
 * Forgot password - Generate reset token and email user
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Return standard message to prevent email enumeration
    return { message: "If an account exists, a password reset email has been dispatched." };
  }

  // Generate random reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      to: user.email,
      subject: "Fit Bari - Password Reset Request",
      text: `Your password reset code/token is: ${resetToken}\nThis token expires in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #173F35;">
          <h2>Fit Bari Password Reset</h2>
          <p>You requested a password reset for your account.</p>
          <p>Your reset token is: <strong>${resetToken}</strong></p>
          <p>This token is valid for 10 minutes.</p>
        </div>
      `,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw ApiError.internal("Failed to send password reset email. Please try again later.");
  }

  return { message: "If an account exists, a password reset email has been dispatched." };
};

/**
 * Reset password using valid reset token
 */
const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiError.badRequest("Password reset token is invalid or has expired.");
  }

  user.password = await hashPassword(newPassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return { message: "Password reset successful. You may now log in with your new credentials." };
};

/**
 * Change password for logged-in user
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw ApiError.notFound("User not found.");
  }

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    throw ApiError.badRequest("Current password does not match.");
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  return { message: "Password updated successfully." };
};

module.exports = {
  register,
  adminRegister,
  login,
  adminLogin,
  forgotPassword,
  resetPassword,
  changePassword,
};

