const express = require("express");
const uploadController = require("./upload.controller");
const { upload } = require("../../helpers/upload");
const { authenticate } = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");
const { ROLES } = require("../../constants/roles");

const router = express.Router();

// Protected upload endpoints (administrative staff only)
router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER));

// Single image upload (field: "image" or "file")
router.post(
  "/",
  upload.single("image"),
  uploadController.uploadSingle
);

// Multiple image upload (field: "images")
router.post(
  "/multiple",
  upload.array("images", 10),
  uploadController.uploadMultiple
);

// Get client auth parameters for direct SDK uploads
router.get("/auth", uploadController.getAuthParameters);

// Delete uploaded image by fileId
router.delete("/:fileId", uploadController.deleteImage);

module.exports = router;

