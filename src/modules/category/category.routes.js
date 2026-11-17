const express = require("express");
const categoryController = require("./category.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");
const { ROLES } = require("../../constants/roles");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("./category.validation");

const router = express.Router();

// ============================================================================
// Public Endpoints (Shoppers & Storefront Carousel)
// ============================================================================
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategory);

// ============================================================================
// Protected Administrative Endpoints (Admin Portal)
// ============================================================================
router.post(
  "/",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(createCategorySchema),
  categoryController.createCategory
);

router.post(
  "/init-standards",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  categoryController.initStandards
);

router.patch(
  "/:id",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  categoryController.deleteCategory
);

module.exports = router;

