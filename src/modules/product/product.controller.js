const catchAsync = require("../../utils/catchAsync");
const ApiResponse = require("../../utils/ApiResponse");
const productService = require("./product.service");

/**
 * Public: Get paginated product catalog
 */
const getProducts = catchAsync(async (req, res) => {
  const { products, meta } = await productService.getProducts(req.query);
  return ApiResponse.success(res, "Products retrieved successfully", products, meta);
});

/**
 * Public: Get product details by slug or ID
 */
const getProductBySlugOrId = catchAsync(async (req, res) => {
  const product = await productService.getProductBySlugOrId(req.params.identifier);
  return ApiResponse.success(res, "Product retrieved successfully", product);
});

/**
 * Public: Get related products in same category
 */
const getRelatedProducts = catchAsync(async (req, res) => {
  const { categorySlug, productId } = req.query;
  const related = await productService.getRelatedProducts(categorySlug, productId);
  return ApiResponse.success(res, "Related products retrieved successfully", related);
});

/**
 * Admin: Create a new product
 */
const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return ApiResponse.created(res, "Product created successfully", product);
});

/**
 * Admin: Update existing product
 */
const updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  return ApiResponse.success(res, "Product updated successfully", product);
});

/**
 * Admin: Delete/Archive product
 */
const deleteProduct = catchAsync(async (req, res) => {
  const soft = req.query.soft === "true";
  const result = await productService.deleteProduct(req.params.id, soft);
  return ApiResponse.success(res, result.message, { id: result.id });
});

module.exports = {
  getProducts,
  getProductBySlugOrId,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

