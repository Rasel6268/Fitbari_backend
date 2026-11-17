const express = require("express");
const orderController = require("./order.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate, optionalAuth } = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");
const { ROLES } = require("../../constants/roles");
const {
  createOrderSchema,
  confirmOrderSchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  queryOrdersSchema,
} = require("./order.validation");

const router = express.Router();

// ============================================================================
// PUBLIC & GUEST ENDPOINTS: Shoppers can order & track without registering
// ============================================================================
// optionalAuth attaches user if signed in, but allows guest checkout!
router.post("/", optionalAuth, validate(createOrderSchema), orderController.createOrder);
router.get("/track/:orderNumber", orderController.trackOrder);

// ============================================================================
// ADMIN SPECIFIC AGGREGATES & LISTINGS (Must precede `/:id` route parameter)
// ============================================================================
router.get(
  "/admin/stats",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
  orderController.getOrderStats
);

router.get(
  "/admin/all",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
  validate({ query: queryOrdersSchema }),
  orderController.getAllOrders
);

// ============================================================================
// SPECIFIC ORDER ACTIONS (Confirm, Cancel, Status, Payment)
// ============================================================================
router.patch(
  "/:id/confirm",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
  validate(confirmOrderSchema),
  orderController.confirmOrder
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
  validate(cancelOrderSchema),
  orderController.cancelOrder
);

router.patch(
  "/:id/status",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

router.patch(
  "/:id/payment",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(updatePaymentStatusSchema),
  orderController.updatePaymentStatus
);

// ============================================================================
// SINGLE ORDER DETAILS (Must be registered AFTER all static /admin routes)
// ============================================================================
router.get("/:id", authenticate, orderController.getOrderById);

module.exports = router;
