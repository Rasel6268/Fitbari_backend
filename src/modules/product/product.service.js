const Product = require("./product.model");
const ApiError = require("../../utils/ApiError");
const { getPaginationOptions, getPaginationMeta } = require("../../helpers/pagination");
const { PRODUCT_STATUS } = require("../../constants/status");

/**
 * Generate URL-friendly slug from string
 */
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Public: Get paginated products with filtering & search
 * NOTE: Completely public - shoppers NEVER need to register to view products.
 */
const getProducts = async (query) => {
  const { page, limit, skip, sort } = getPaginationOptions(query);

  const filter = {
    status: query.status || PRODUCT_STATUS.ACTIVE,
  };

  if (query.category) {
    filter.categorySlug = query.category.toLowerCase();
  }

  if (query.isBestSeller === "true") {
    filter.isBestSeller = true;
  }

  if (query.isTrending === "true") {
    filter.isTrending = true;
  }

  if (query.isNewArrival === "true") {
    filter.isNewArrival = true;
  }

  // Price range filters
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  // Search keyword (case-insensitive name or text index)
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { tags: { $in: [new RegExp(query.search, "i")] } },
      { categorySlug: { $regex: query.search, $options: "i" } },
    ];
  }

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  const meta = getPaginationMeta(total, page, limit);

  return { products, meta };
};

/**
 * Public: Get single product by slug or ID
 */
const getProductBySlugOrId = async (identifier) => {
  const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
  const filter = isObjectId ? { _id: identifier } : { slug: identifier.toLowerCase() };

  const product = await Product.findOne(filter);
  if (!product) {
    throw ApiError.notFound(`Product not found with identifier '${identifier}'`);
  }

  return product;
};

/**
 * Public: Get related products in same category
 */
const getRelatedProducts = async (categorySlug, currentProductId, limit = 4) => {
  return Product.find({
    categorySlug,
    _id: { $ne: currentProductId },
    status: PRODUCT_STATUS.ACTIVE,
  })
    .limit(limit)
    .sort({ rating: -1, createdAt: -1 });
};

/**
 * Admin: Create a new product
 */
const createProduct = async (productData) => {
  const slug = productData.slug ? generateSlug(productData.slug) : generateSlug(productData.name);

  // Check unique slug collision
  const existingSlug = await Product.findOne({ slug });
  if (existingSlug) {
    throw ApiError.conflict(`A product with slug '${slug}' already exists. Please choose a different title or slug.`);
  }

  productData.slug = slug;

  // Auto calculate discount percentage if original price provided
  if (productData.originalPrice && productData.originalPrice > productData.price) {
    productData.discountPercentage = Math.round(
      ((productData.originalPrice - productData.price) / productData.originalPrice) * 100
    );
  }

  const product = await Product.create(productData);
  return product;
};

/**
 * Admin: Update product by ID
 */
const updateProduct = async (id, updateData) => {
  if (updateData.slug) {
    updateData.slug = generateSlug(updateData.slug);
    const existing = await Product.findOne({ slug: updateData.slug, _id: { $ne: id } });
    if (existing) {
      throw ApiError.conflict(`Slug '${updateData.slug}' is already taken by another product.`);
    }
  }

  if (updateData.originalPrice && updateData.price && updateData.originalPrice > updateData.price) {
    updateData.discountPercentage = Math.round(
      ((updateData.originalPrice - updateData.price) / updateData.originalPrice) * 100
    );
  }

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw ApiError.notFound("Product not found");
  }

  return product;
};

/**
 * Admin: Delete product by ID (Soft delete or hard delete)
 */
const deleteProduct = async (id, soft = true) => {
  if (soft) {
    const product = await Product.findByIdAndUpdate(
      id,
      { status: PRODUCT_STATUS.ARCHIVED },
      { new: true }
    );
    if (!product) throw ApiError.notFound("Product not found");
    return { message: "Product archived successfully", id };
  }

  const product = await Product.findByIdAndDelete(id);
  if (!product) throw ApiError.notFound("Product not found");
  return { message: "Product permanently deleted", id };
};

module.exports = {
  getProducts,
  getProductBySlugOrId,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

