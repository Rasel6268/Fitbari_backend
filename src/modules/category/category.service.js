const Category = require("./category.model");
const Product = require("../product/product.model");
const ApiError = require("../../utils/ApiError");

/**
 * Generate URL-friendly slug from string
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

/**
 * Create a new category
 */
const createCategory = async (categoryData) => {
  const slug = categoryData.slug
    ? slugify(categoryData.slug)
    : slugify(categoryData.name);

  const existing = await Category.findOne({ slug });
  if (existing) {
    throw ApiError.conflict(`A category with slug '${slug}' already exists.`);
  }

  const category = await Category.create({
    ...categoryData,
    slug,
  });

  return category;
};

/**
 * Get all categories
 */
const getAllCategories = async (query = {}) => {
  const filter = {};
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true" || query.isActive === true;
  }
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { nameBn: { $regex: query.search, $options: "i" } },
      { slug: { $regex: query.search, $options: "i" } },
    ];
  }

  const categories = await Category.find(filter).sort({ order: 1, createdAt: 1 });
  return categories;
};

/**
 * Get category by ID or Slug
 */
const getCategoryByIdOrSlug = async (identifier) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const query = isObjectId ? { _id: identifier } : { slug: identifier };

  const category = await Category.findOne(query);
  if (!category) {
    throw ApiError.notFound("Category not found");
  }
  return category;
};

/**
 * Update category by ID
 */
const updateCategory = async (id, updateData) => {
  if (updateData.slug) {
    updateData.slug = slugify(updateData.slug);
    const existing = await Category.findOne({
      slug: updateData.slug,
      _id: { $ne: id },
    });
    if (existing) {
      throw ApiError.conflict(`A category with slug '${updateData.slug}' already exists.`);
    }
  }

  const category = await Category.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw ApiError.notFound("Category not found");
  }

  return category;
};

/**
 * Delete category by ID
 */
const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound("Category not found");
  }

  // Check if active products are assigned to this category
  const productCount = await Product.countDocuments({ categorySlug: category.slug });
  if (productCount > 0) {
    throw ApiError.badRequest(
      `Cannot delete category '${category.name}' because ${productCount} product(s) are currently assigned to it. Reassign or delete products first.`
    );
  }

  await Category.findByIdAndDelete(id);
  return { message: `Category '${category.name}' deleted successfully.` };
};

/**
 * Initialize / Sync the 8 Standard Fit Bari Categories
 */
const initStandardCategories = async () => {
  const standards = [
    {
      name: "Natural Honey",
      nameBn: "মধু",
      slug: "honey",
      sublabel: "Wild Sundarban & Mustard Blossom",
      image: "/images/honey-harvest.png",
      order: 1,
    },
    {
      name: "Combo Pack",
      nameBn: "Combo Pack",
      slug: "combo-packages",
      sublabel: "Curated Stacks & Daily Bundles",
      image: "/images/combo-packages.png",
      order: 2,
    },
    {
      name: "GYM Supplement",
      nameBn: "GYM Supplement",
      slug: "gym-supplements",
      sublabel: "Clean Whey, Creatine & Recovery",
      image: "/images/gym-supplements.png",
      order: 3,
    },
    {
      name: "Dates & Superfoods",
      nameBn: "খেজুর",
      slug: "dates-superfoods",
      sublabel: "Madinah Ajwa & King Medjool",
      image: "/images/dates-superfoods.png",
      order: 4,
    },
    {
      name: "Oats & Seeds",
      nameBn: "ওটস ও বীজ",
      slug: "oats-seeds",
      sublabel: "Peruvian Chia & Australian Oats",
      image: "/images/oats-seeds.png",
      order: 5,
    },
    {
      name: "Healthy Foods",
      nameBn: "ঔষধি ও স্বাস্থ্যকর পণ্য",
      slug: "healthy-foods",
      sublabel: "Natural Peanut Butter & Granola",
      image: "/images/healthy-foods.png",
      order: 6,
    },
    {
      name: "Nuts & Dry Fruits",
      nameBn: "বাদাম ও Dry Fruits",
      slug: "nuts-dry-fruits",
      sublabel: "California Whole Almonds & Cashews",
      image: "/images/nuts-dry-fruits.png",
      order: 7,
    },
    {
      name: "Ghee & Natural Oils",
      nameBn: "ঘি ও প্রাকৃতিক তেল",
      slug: "ghee-natural-oils",
      sublabel: "Traditional Bilona & Black Seed Oil",
      image: "/images/ghee-natural-oils.png",
      order: 8,
    },
  ];

  let added = 0;
  for (const cat of standards) {
    const exists = await Category.findOne({ slug: cat.slug });
    if (!exists) {
      await Category.create(cat);
      added++;
    }
  }

  const all = await Category.find().sort({ order: 1 });
  return { message: `Initialized ${added} category collections`, categories: all };
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryByIdOrSlug,
  updateCategory,
  deleteCategory,
  initStandardCategories,
};

