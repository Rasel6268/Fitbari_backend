const catchAsync = require("../../utils/catchAsync");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");
const { uploadToImageKit, deleteFromImageKit, getImageKitInstance } = require("../../helpers/upload");

/**
 * Upload single image to ImageKit
 */
const uploadSingle = catchAsync(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest("No image file uploaded. Please attach an image in 'image' field.");
  }

  const result = await uploadToImageKit(
    req.file.buffer,
    req.file.originalname,
    "/fitbari/products"
  );

  return ApiResponse.success(res, "Image uploaded successfully to ImageKit", result);
});

/**
 * Upload multiple images to ImageKit
 */
const uploadMultiple = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest("No image files uploaded.");
  }

  const uploadPromises = req.files.map((file) =>
    uploadToImageKit(file.buffer, file.originalname, "/fitbari/products")
  );

  const results = await Promise.all(uploadPromises);

  return ApiResponse.success(res, `${results.length} image(s) uploaded successfully to ImageKit`, results);
});

/**
 * Get ImageKit client-side authentication parameters
 */
const getAuthParameters = catchAsync(async (req, res) => {
  try {
    const ik = getImageKitInstance();
    const authParams = ik.getAuthenticationParameters();
    return ApiResponse.success(res, "ImageKit auth parameters retrieved", authParams);
  } catch (error) {
    throw ApiError.internal(`Failed to get ImageKit auth: ${error.message}`);
  }
});

/**
 * Delete image from ImageKit
 */
const deleteImage = catchAsync(async (req, res) => {
  const { fileId } = req.params;
  const result = await deleteFromImageKit(fileId);
  return ApiResponse.success(res, "Image deleted successfully from ImageKit", result);
});

module.exports = {
  uploadSingle,
  uploadMultiple,
  getAuthParameters,
  deleteImage,
};
