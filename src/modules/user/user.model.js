const mongoose = require("mongoose");
const { ROLES, ALL_ROLES } = require("../../constants/roles");

/**
 * Administrative Staff User Model
 *
 * NOTE: Customers never need authentication or account creation.
 * This model strictly stores administrative staff (SUPER_ADMIN, ADMIN, MANAGER)
 * who manage products, catalog, inventory, and order fulfillment.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Administrator full name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Work email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ALL_ROLES,
      default: ROLES.ADMIN,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ role: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
