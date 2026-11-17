const { z } = require("zod");
const { PRODUCT_STATUS } = require("../../constants/status");

const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").max(200),
  nameBn: z.string().optional(),
  slug: z.string().min(2).max(200).optional(), // Can be auto-generated from name
  categorySlug: z.string().min(2),
  price: z.number().positive("Price must be greater than zero"),
  originalPrice: z.number().positive().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  stock: z.number().int().min(0),
  sku: z.string().optional(),
  images: z.array(z.string().url("Must be valid image URL")).min(1, "At least one image is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().optional(),
  nutritionFacts: z
    .object({
      servingSize: z.string().optional(),
      calories: z.number().optional(),
      protein: z.string().optional(),
      carbohydrates: z.string().optional(),
      fat: z.string().optional(),
      fiber: z.string().optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  isBestSeller: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  status: z.enum(Object.values(PRODUCT_STATUS)).optional(),
});

const updateProductSchema = createProductSchema.partial();

const queryProductSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  isBestSeller: z.enum(["true", "false"]).optional(),
  isTrending: z.enum(["true", "false"]).optional(),
  isNewArrival: z.enum(["true", "false"]).optional(),
  status: z.enum(Object.values(PRODUCT_STATUS)).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  queryProductSchema,
};

