const mongoose = require("mongoose");
const Order = require("./order.model");
const Product = require("../product/product.model");
const ApiError = require("../../utils/ApiError");
const { getPaginationOptions, getPaginationMeta } = require("../../helpers/pagination");
const { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } = require("../../constants/status");

/**
 * Generate unique human-readable order number (e.g. FB-839201)
 */
const generateOrderNumber = () => {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `FB-${randomDigits}`;
};

/**
 * Guest or Registered Customer: Place a new order
 * NOTE: Completely open to guest checkout without registration!
 */
const createOrder = async (orderData, authenticatedUserId = null) => {
  let orderNumber = generateOrderNumber();

  // Ensure unique orderNumber
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 5) {
    const existing = await Order.findOne({ orderNumber });
    if (!existing) {
      isUnique = true;
    } else {
      orderNumber = generateOrderNumber();
      attempts++;
    }
  }

  // Attach mongoose product ObjectId if productId matches valid ObjectId
  const preparedItems = orderData.items.map((item) => {
    const isObjectId = mongoose.Types.ObjectId.isValid(item.productId);
    return {
      product: isObjectId ? new mongoose.Types.ObjectId(item.productId) : undefined,
      productId: String(item.productId),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      subtotal: item.subtotal || item.price * item.quantity,
    };
  });

  const newOrder = await Order.create({
    orderNumber,
    user: authenticatedUserId || null,
    customer: orderData.customer,
    items: preparedItems,
    subtotal: orderData.subtotal,
    shippingCost: orderData.shippingCost,
    discountAmount: orderData.discountAmount || 0,
    totalAmount: orderData.totalAmount,
    paymentMethod: orderData.paymentMethod || PAYMENT_METHOD.COD,
    paymentStatus: PAYMENT_STATUS.PENDING,
    orderStatus: ORDER_STATUS.PENDING,
    trackingHistory: [
      {
        status: ORDER_STATUS.PENDING,
        note: "Order received online. Queued for confirmation and packaging inspection.",
        timestamp: new Date(),
      },
    ],
  });

  return newOrder;
};

/**
 * Guest or Customer: Track order by Order Number and optional Phone
 * No account or password required!
 */
const trackOrder = async (orderNumber, phone = "") => {
  if (!orderNumber) {
    throw ApiError.badRequest("Order number is required");
  }

  const query = { orderNumber: orderNumber.toUpperCase().trim() };
  if (phone && phone.trim()) {
    const cleanPhone = phone.trim();
    // Match either full phone number or last 10 digits
    query["customer.phone"] = { $regex: cleanPhone.slice(-10), $options: "i" };
  }

  const order = await Order.findOne(query);
  if (!order) {
    throw ApiError.notFound("No order found matching the provided order number and phone details.");
  }

  return order;
};

/**
 * Get order by ID
 */
const getOrderById = async (id, userId = null, isAdmin = false) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest("Invalid order ID format");
  }

  const order = await Order.findById(id);
  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  // If not admin, ensure the requesting user owns the order
  if (!isAdmin && userId && order.user && order.user.toString() !== userId.toString()) {
    throw ApiError.forbidden("You do not have permission to view this order.");
  }

  return order;
};

/**
 * Admin: Get all orders with pagination and filtering
 */
const getAllOrders = async (query) => {
  const { page, limit, skip, sort } = getPaginationOptions(query);

  const filter = {};
  if (query.orderStatus && query.orderStatus !== "ALL") {
    filter.orderStatus = query.orderStatus;
  }
  if (query.paymentStatus && query.paymentStatus !== "ALL") {
    filter.paymentStatus = query.paymentStatus;
  }
  if (query.paymentMethod && query.paymentMethod !== "ALL") {
    filter.paymentMethod = query.paymentMethod;
  }
  if (query.search) {
    filter.$or = [
      { orderNumber: { $regex: query.search, $options: "i" } },
      { "customer.name": { $regex: query.search, $options: "i" } },
      { "customer.phone": { $regex: query.search, $options: "i" } },
      { "customer.city": { $regex: query.search, $options: "i" } },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort(sort).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  const meta = getPaginationMeta(total, page, limit);

  return { orders, meta };
};

/**
 * Admin: Explicit Confirm Order action
 * Moves order from PENDING -> CONFIRMED and records audit entry
 */
const confirmOrder = async (id, note = "") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest("Invalid order ID format");
  }

  const order = await Order.findById(id);
  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  if (order.orderStatus === ORDER_STATUS.CONFIRMED) {
    return order; // Already confirmed
  }

  if (order.orderStatus === ORDER_STATUS.CANCELLED) {
    throw ApiError.badRequest("Cannot confirm an order that has already been cancelled.");
  }

  order.orderStatus = ORDER_STATUS.CONFIRMED;
  order.trackingHistory.push({
    status: ORDER_STATUS.CONFIRMED,
    note: note || "Order verified and confirmed by Fit Bari fulfillment desk.",
    timestamp: new Date(),
  });

  // Attempt stock deduction for products matching MongoDB ObjectId
  try {
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -Math.abs(item.quantity) },
        });
      }
    }
  } catch (stockErr) {
    console.warn("Stock deduction notice:", stockErr.message);
  }

  await order.save();
  return order;
};

/**
 * Admin: Explicit Cancel Order action
 * Restores stock and marks status as CANCELLED
 */
const cancelOrder = async (id, reason = "") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest("Invalid order ID format");
  }

  const order = await Order.findById(id);
  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  if (order.orderStatus === ORDER_STATUS.CANCELLED) {
    return order;
  }

  const wasConfirmedOrProcessed = [
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
  ].includes(order.orderStatus);

  order.orderStatus = ORDER_STATUS.CANCELLED;
  order.trackingHistory.push({
    status: ORDER_STATUS.CANCELLED,
    note: reason || "Order cancelled by administrator.",
    timestamp: new Date(),
  });

  // If stock was deducted previously, restore it
  if (wasConfirmedOrProcessed) {
    try {
      for (const item of order.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: Math.abs(item.quantity) },
          });
        }
      }
    } catch (stockErr) {
      console.warn("Stock restoration notice:", stockErr.message);
    }
  }

  await order.save();
  return order;
};

/**
 * Admin: Update order status (with history logging)
 */
const updateOrderStatus = async (id, newStatus, note = "") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest("Invalid order ID format");
  }

  const order = await Order.findById(id);
  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  const previousStatus = order.orderStatus;
  order.orderStatus = newStatus;

  // Auto-mark COD orders as PAID when delivered
  if (newStatus === ORDER_STATUS.DELIVERED && order.paymentMethod === PAYMENT_METHOD.COD) {
    order.paymentStatus = PAYMENT_STATUS.PAID;
  }

  order.trackingHistory.push({
    status: newStatus,
    note: note || `Order fulfillment status updated from ${previousStatus} to ${newStatus}.`,
    timestamp: new Date(),
  });

  await order.save();
  return order;
};

/**
 * Admin: Update payment status
 */
const updatePaymentStatus = async (id, paymentStatus) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest("Invalid order ID format");
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { paymentStatus },
    { new: true, runValidators: true }
  );

  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  return order;
};

/**
 * Admin: Aggregated KPI statistics for orders dashboard
 */
const getOrderStats = async () => {
  const [
    totalOrders,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    revenueAgg,
    todayOrdersAgg,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: ORDER_STATUS.PENDING }),
    Order.countDocuments({ orderStatus: ORDER_STATUS.CONFIRMED }),
    Order.countDocuments({ orderStatus: ORDER_STATUS.PROCESSING }),
    Order.countDocuments({ orderStatus: ORDER_STATUS.SHIPPED }),
    Order.countDocuments({ orderStatus: ORDER_STATUS.DELIVERED }),
    Order.countDocuments({ orderStatus: ORDER_STATUS.CANCELLED }),
    Order.aggregate([
      { $match: { orderStatus: { $ne: ORDER_STATUS.CANCELLED } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      },
      {
        $group: {
          _id: null,
          todayOrders: { $sum: 1 },
          todayRevenue: {
            $sum: {
              $cond: [{ $ne: ["$orderStatus", ORDER_STATUS.CANCELLED] }, "$totalAmount", 0],
            },
          },
        },
      },
    ]),
  ]);

  return {
    totalOrders,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue: revenueAgg[0]?.totalRevenue || 0,
    todayOrders: todayOrdersAgg[0]?.todayOrders || 0,
    todayRevenue: todayOrdersAgg[0]?.todayRevenue || 0,
  };
};

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
