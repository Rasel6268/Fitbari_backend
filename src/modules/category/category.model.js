const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category English title is required"],
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    nameBn: {
      type: String,
      trim: true,
      default: "",
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    sublabel: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      required: [true, "Category image URL is required"],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for products count (if populated)
categorySchema.virtual("products", {
  ref: "Product",
  localField: "slug",
  foreignField: "categorySlug",
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;

