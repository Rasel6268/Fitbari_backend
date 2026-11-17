const { z } = require("zod");

const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(100),
  nameBn: z.string().optional(),
  slug: z.string().min(2, "Slug must be at least 2 characters").optional(),
  sublabel: z.string().optional(),
  description: z.string().optional(),
  image: z.string().min(1, "Category image URL is required"),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(100).optional(),
  nameBn: z.string().optional(),
  slug: z.string().min(2, "Slug must be at least 2 characters").optional(),
  sublabel: z.string().optional(),
  description: z.string().optional(),
  image: z.string().min(1).optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};

