const mongoose = require("mongoose");
const env = require("./env");

/**
 * Connect to MongoDB with robust reconnection handling
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongodbUri, {
      autoIndex: !env.isProduction, // Disable automatic index builds in production
    });

    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error(`[Database] MongoDB runtime connection error:`, err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn(`[Database] MongoDB disconnected. Attempting reconnect...`);
    });

    return conn;
  } catch (error) {
    console.error(`[Database] Initial MongoDB connection error:`, error.message);
    // In production or containers, exit on database connection failure
    if (env.isProduction) {
      process.exit(1);
    }
  }
};

module.exports = connectDB;

