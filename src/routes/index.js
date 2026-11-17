const express = require("express");
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/user/user.routes");
const productRoutes = require("../modules/product/product.routes");
const categoryRoutes = require("../modules/category/category.routes");
const orderRoutes = require("../modules/order/order.routes");
const uploadRoutes = require("../modules/upload/upload.routes");
const settingRoutes = require("../modules/setting/setting.routes");

const router = express.Router();

/**
 * Health Check Endpoint
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "Fit Bari E-commerce API",
    version: "1.0.0",
  });
});

/**
 * Mount Module Routes
 */
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/orders", orderRoutes);
router.use("/upload", uploadRoutes);
router.use("/settings", settingRoutes);

module.exports = router;
