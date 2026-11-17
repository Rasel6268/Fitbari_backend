const Setting = require("./setting.model");

/**
 * Default initial store configuration
 */
const DEFAULT_SETTINGS = {
  storeName: "FIT BARI – Pure Nutrition & Single-Origin Harvests",
  tagline: "Fuel Your Body. Nourish Your Life.",
  currency: "BDT (৳)",
  currencySymbol: "৳",
  supportPhone: "01712-345678",
  supportEmail: "support@fitbari.com",
  officeAddress: "House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh",
  operatingHours: "Sat – Thu: 9:00 AM – 9:00 PM, Fri: 2:00 PM – 9:00 PM",
  dhakaShipping: 80,
  outsideDhakaShipping: 130,
  freeShippingThreshold: 2000,
  estimatedDeliveryDhaka: "12-24 Hours Express Dispatch",
  estimatedDeliveryOutside: "48-72 Hours Nationwide Delivery",
  whatsappNumber: "+8801712345678",
  facebookUrl: "https://facebook.com/fitbari",
  instagramUrl: "https://instagram.com/fitbari",
  announcements: [
    "100% Lab-Verified Single-Origin Sundarban Honey & Micro-Filtered Protein",
    "Verified batch authenticity — Inspection before payment supported nationwide",
  ],
  codEnabled: true,
  bkashEnabled: true,
  nagadEnabled: true,
  imagekitEndpoint: "https://ik.imagekit.io/fitbari",
};

/**
 * Get singleton store settings (Initializes if not existing)
 */
const getSettings = async () => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create(DEFAULT_SETTINGS);
  }
  return settings;
};

/**
 * Update singleton store settings
 */
const updateSettings = async (updateData) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({ ...DEFAULT_SETTINGS, ...updateData });
    return settings;
  }

  // Update allowed fields
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] !== undefined) {
      settings[key] = updateData[key];
    }
  });

  await settings.save();
  return settings;
};

/**
 * Reset settings to default values
 */
const resetSettings = async () => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create(DEFAULT_SETTINGS);
    return settings;
  }

  Object.assign(settings, DEFAULT_SETTINGS);
  await settings.save();
  return settings;
};

module.exports = {
  getSettings,
  updateSettings,
  resetSettings,
};
