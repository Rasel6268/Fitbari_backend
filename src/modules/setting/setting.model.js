const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "FIT BARI",
      trim: true,
    },
    tagline: {
      type: String,
      default: "Fuel Your Body. Nourish Your Life.",
      trim: true,
    },
    currency: {
      type: String,
      default: "BDT (৳)",
      trim: true,
    },
    currencySymbol: {
      type: String,
      default: "৳",
      trim: true,
    },
    supportPhone: {
      type: String,
      default: "01712-345678",
      trim: true,
    },
    supportEmail: {
      type: String,
      default: "support@fitbari.com",
      trim: true,
    },
    officeAddress: {
      type: String,
      default: "House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh",
      trim: true,
    },
    operatingHours: {
      type: String,
      default: "Sat – Thu: 9:00 AM – 9:00 PM, Fri: 2:00 PM – 9:00 PM",
      trim: true,
    },
    // Delivery & Logistics
    dhakaShipping: {
      type: Number,
      default: 80,
      min: 0,
    },
    outsideDhakaShipping: {
      type: Number,
      default: 130,
      min: 0,
    },
    freeShippingThreshold: {
      type: Number,
      default: 2000,
      min: 0,
    },
    estimatedDeliveryDhaka: {
      type: String,
      default: "12-24 Hours Express Dispatch",
      trim: true,
    },
    estimatedDeliveryOutside: {
      type: String,
      default: "48-72 Hours Nationwide Delivery",
      trim: true,
    },
    // Social & Messaging
    whatsappNumber: {
      type: String,
      default: "+8801712345678",
      trim: true,
    },
    facebookUrl: {
      type: String,
      default: "https://facebook.com/fitbari",
      trim: true,
    },
    instagramUrl: {
      type: String,
      default: "https://instagram.com/fitbari",
      trim: true,
    },
    // Announcements list
    announcements: {
      type: [String],
      default: [
        "100% Lab-Verified Single-Origin Sundarban Honey & Micro-Filtered Protein",
        "Verified batch authenticity — Inspection before payment supported nationwide",
      ],
    },
    // Payment Gateway Toggles
    codEnabled: {
      type: Boolean,
      default: true,
    },
    bkashEnabled: {
      type: Boolean,
      default: true,
    },
    nagadEnabled: {
      type: Boolean,
      default: true,
    },
    // ImageKit & Media Storage
    imagekitEndpoint: {
      type: String,
      default: "https://ik.imagekit.io/fitbari",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;
