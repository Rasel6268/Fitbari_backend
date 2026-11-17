const catchAsync = require("../../utils/catchAsync");
const ApiResponse = require("../../utils/ApiResponse");
const categoryService = require("./category.service");

/**
 * Create a new category (Admin only)
 */
const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  return ApiResponse.created(res, "Category created successfully", category);
});

/**
 * Get all categories (Public / Admin)
 */
const getAllCategories = catchAsync(async (req, res) => {
  const categories = await categoryService.getAllCategories(req.query);
  return ApiResponse.success(res, "Categories retrieved successfully", categories);
});

/**
 * Get category by ID or Slug (Public)
 */
const getCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryByIdOrSlug(req.params.id);
  return ApiResponse.success(res, "Category retrieved successfully", category);
});

/**
 * Update category by ID (Admin only)
 */
const updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  return ApiResponse.success(res, "Category updated successfully", category);
});

/**
 * Delete category by ID (Admin only)
 */
const deleteCategory = catchAsync(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id);
  return ApiResponse.success(res, result.message);
});

/**
 * Initialize 8 standard Fit Bari categories (Admin only)
 */
const initStandards = catchAsync(async (req, res) => {
  const result = await categoryService.initStandardCategories();
  return ApiResponse.success(res, result.message, result.categories);
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  initStandards,
};

