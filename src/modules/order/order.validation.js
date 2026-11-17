const { z } = require("zod");
const { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } = require("../../constants/status");

const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Product name is required"),
  price: z.number().nonnegative("Item price cannot be negative"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  image: z.string().min(1, "Product image URL is required"),
  subtotal: z.number().nonnegative("Item subtotal cannot be negative"),
});

const customerDetailsSchema = z.object({
  name: z.string().min(2, "Customer name must be at least 2 characters").max(100),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  city: z.string().min(2, "City/District is required"),
  address: z.string().min(5, "Full delivery address is required"),
  notes: z.string().max(500).optional(),
});

const createOrderSchema = z.object({
  customer: customerDetailsSchema,
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
  subtotal: z.number().min(0),
  shippingCost: z.number().min(0),
  discountAmount: z.number().min(0).optional(),
  totalAmount: z.number().positive("Total amount must be greater than zero"),
  paymentMethod: z.enum(Object.values(PAYMENT_METHOD)).optional(),
});

const confirmOrderSchema = z.object({
  note: z.string().max(500).optional(),
});

const cancelOrderSchema = z.object({
  reason: z.string().max(500).optional(),
});

const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(Object.values(ORDER_STATUS)),
  note: z.string().max(500).optional(),
});

const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(Object.values(PAYMENT_STATUS)),
});

const queryOrdersSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  orderStatus: z.string().optional(),
  paymentStatus: z.string().optional(),
  paymentMethod: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

module.exports = {
  createOrderSchema,
  confirmOrderSchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  queryOrdersSchema,
};
