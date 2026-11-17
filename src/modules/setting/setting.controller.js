const catchAsync = require("../../utils/catchAsync");
const ApiResponse = require("../../utils/ApiResponse");
const settingService = require("./setting.service");

/**
 * Public: Get store settings for storefront & admin
 */
const getSettings = catchAsync(async (req, res) => {
  const settings = await settingService.getSettings();
  return ApiResponse.success(res, "Store configurations retrieved successfully", settings);
});

/**
 * Admin: Update store configurations
 */
const updateSettings = catchAsync(async (req, res) => {
  const updated = await settingService.updateSettings(req.body);
  return ApiResponse.success(res, "Store configurations updated successfully", updated);
});

/**
 * Admin: Reset configurations to default
 */
const resetSettings = catchAsync(async (req, res) => {
  const settings = await settingService.resetSettings();
  return ApiResponse.success(res, "Store configurations reset to defaults", settings);
});

module.exports = {
  getSettings,
  updateSettings,
  resetSettings,
};
