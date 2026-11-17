const { z } = require("zod");

const updateSettingSchema = z.object({
  storeName: z.string().min(1).max(120).optional(),
  tagline: z.string().max(200).optional(),
  currency: z.string().max(30).optional(),
  currencySymbol: z.string().max(10).optional(),
  supportPhone: z.string().max(30).optional(),
  supportEmail: z.string().email().optional().or(z.literal("")),
  officeAddress: z.string().max(300).optional(),
  operatingHours: z.string().max(200).optional(),
  dhakaShipping: z.number().min(0).optional(),
  outsideDhakaShipping: z.number().min(0).optional(),
  freeShippingThreshold: z.number().min(0).optional(),
  estimatedDeliveryDhaka: z.string().max(100).optional(),
  estimatedDeliveryOutside: z.string().max(100).optional(),
  whatsappNumber: z.string().max(30).optional(),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  announcements: z.array(z.string()).optional(),
  codEnabled: z.boolean().optional(),
  bkashEnabled: z.boolean().optional(),
  nagadEnabled: z.boolean().optional(),
  imagekitEndpoint: z.string().max(250).optional(),
});

module.exports = {
  updateSettingSchema,
};
