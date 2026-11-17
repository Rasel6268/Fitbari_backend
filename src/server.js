const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/database");

let server;

/**
 * Bootstrap Server and Database Connections
 */
const bootstrap = async () => {
  // Connect to MongoDB
  await connectDB();

  // Start HTTP Server
  server = app.listen(env.port, () => {
    console.log(`=================================================`);
    console.log(`Fit Bari API running in [${env.nodeEnv}] mode`);
    console.log(`Port: http://localhost:${env.port}`);
    console.log(`Health Check: http://localhost:${env.port}/api/v1/health`);
    console.log(`=================================================`);
  });
};

// Graceful Shutdown Handler
const gracefulShutdown = (signal) => {
  console.log(`[Server] ${signal} signal received. Closing HTTP server gracefully...`);
  if (server) {
    server.close(() => {
      console.log(`[Server] HTTP server closed.`);
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Listen for process termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle Uncaught Exceptions
process.on("uncaughtException", (error) => {
  console.error(`[Process] Uncaught Exception:`, error);
  process.exit(1);
});

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (reason) => {
  console.error(`[Process] Unhandled Promise Rejection:`, reason);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Start the server
bootstrap();

