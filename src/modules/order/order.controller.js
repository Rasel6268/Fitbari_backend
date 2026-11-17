const catchAsync = require("../../utils/catchAsync");
const ApiResponse = require("../../utils/ApiResponse");
const orderService = require("./order.service");
const { ROLES } = require("../../constants/roles");

/**
 * Public & Guest: Place an order
 */
const createOrder = catchAsync(async (req, res) => {
  const userId = req.user ? req.user._id : null;
  const order = await orderService.createOrder(req.body, userId);
  return ApiResponse.created(res, "Order placed successfully", order);
});

/**
 * Public: Track order using order number and phone
 */
const trackOrder = catchAsync(async (req, res) => {
  const { orderNumber } = req.params;
  const { phone } = req.query;
  const order = await orderService.trackOrder(orderNumber, phone);
  return ApiResponse.success(res, "Order tracking details retrieved", order);
});

/**
 * Get order details by ID
 */
const getOrderById = catchAsync(async (req, res) => {
  const userId = req.user ? req.user._id : null;
  const isAdmin =
    req.user && [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER].includes(req.user.role);
  const order = await orderService.getOrderById(req.params.id, userId, isAdmin);
  return ApiResponse.success(res, "Order retrieved successfully", order);
});

/**
 * Admin: Get all orders
 */
const getAllOrders = catchAsync(async (req, res) => {
  const { orders, meta } = await orderService.getAllOrders(req.query);
  return ApiResponse.success(res, "Orders retrieved successfully", orders, meta);
});

/**
 * Admin: Explicit Confirm Order action
 */
const confirmOrder = catchAsync(async (req, res) => {
  const { note } = req.body || {};
  const order = await orderService.confirmOrder(req.params.id, note);
  return ApiResponse.success(res, "Order confirmed successfully", order);
});

/**
 * Admin: Explicit Cancel Order action
 */
const cancelOrder = catchAsync(async (req, res) => {
  const { reason } = req.body || {};
  const order = await orderService.cancelOrder(req.params.id, reason);
  return ApiResponse.success(res, "Order cancelled successfully", order);
});

/**
 * Admin: Update order fulfillment status
 */
const updateOrderStatus = catchAsync(async (req, res) => {
  const { orderStatus, note } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, orderStatus, note);
  return ApiResponse.success(res, "Order status updated successfully", order);
});

/**
 * Admin: Update payment status
 */
const updatePaymentStatus = catchAsync(async (req, res) => {
  const { paymentStatus } = req.body;
  const order = await orderService.updatePaymentStatus(req.params.id, paymentStatus);
  return ApiResponse.success(res, "Payment status updated successfully", order);
});

/**
 * Admin: Get aggregated statistics for dashboard
 */
const getOrderStats = catchAsync(async (req, res) => {
  const stats = await orderService.getOrderStats();
  return ApiResponse.success(res, "Order statistics retrieved successfully", stats);
});

module.exports = {
  createOrder,
  trackOrder,
  getOrderById,
  getAllOrders,
  confirmOrder,
  cancelOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStats,
};
