/**
 * CLI Tool: Create Admin Account
 * Usage: node src/scripts/createAdmin.js --name="Your Name" --email="admin@example.com" --password="StrongPassword123" --phone="01700000000"
 *
 * NOTE: This tool does NOT use seed data. It requires real parameters passed by the administrator.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/database");
const User = require("../modules/user/user.model");
const { hashPassword } = require("../helpers/password");
const { ROLES } = require("../constants/roles");

const parseArgs = () => {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith("--")) {
      const [key, value] = arg.replace(/^--/, "").split("=");
      args[key] = value || true;
    }
  });
  return args;
};

const createAdmin = async () => {
  const args = parseArgs();
  const { name, email, password, phone } = args;

  if (!name || !email || !password) {
    console.error("❌ Error: Missing required arguments.");
    console.log("Usage: node src/scripts/createAdmin.js --name=\"Your Name\" --email=\"admin@yourdomain.com\" --password=\"YourSecretPassword\" [--phone=\"01700000000\"]");
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("❌ Error: Password must be at least 6 characters long.");
    process.exit(1);
  }

  try {
    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.error(`❌ Error: An account with email "${email}" already exists.`);
      process.exit(1);
    }

    const hashedPassword = await hashPassword(password);
    const newAdmin = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      password: hashedPassword,
      role: ROLES.SUPER_ADMIN,
      isActive: true,
    });

    console.log("\n=======================================================");
    console.log("✅ Super Admin Account Successfully Created!");
    console.log(`   ID:    ${newAdmin._id}`);
    console.log(`   Name:  ${newAdmin.name}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Role:  ${newAdmin.role}`);
    console.log("=======================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();

