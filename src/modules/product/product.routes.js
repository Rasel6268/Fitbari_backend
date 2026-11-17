const express = require("express");
const productController = require("./product.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");
const { ROLES } = require("../../constants/roles");
const {
  createProductSchema,
  updateProductSchema,
  queryProductSchema,
} = require("./product.validation");

const router = express.Router();

// ============================================================================
// PUBLIC ROUTES: Browsing & Discovery (No login/registration required)
// ============================================================================
router.get("/", validate({ query: queryProductSchema }), productController.getProducts);
router.get("/related", productController.getRelatedProducts);
router.get("/:identifier", productController.getProductBySlugOrId);

// ============================================================================
// PROTECTED ROUTES: Store Administration (Admin / Super Admin only)
// ============================================================================
router.post(
  "/",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
  validate(createProductSchema),
  productController.createProduct
);

router.patch(
  "/:id",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  productController.deleteProduct
);

module.exports = router;

