const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const env = require("./config/env");
const corsMiddleware = require("./config/cors");
const routes = require("./routes");
const notFoundHandler = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

// Security HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(corsMiddleware);

// Request HTTP logger
if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Request body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static file serving for local uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Mount API v1 routes
app.use("/api/v1", routes);

// Base route ping
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Fit Bari E-commerce API",
    docs: "/api/v1/health",
  });
});

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(errorHandler);

module.exports = app;

