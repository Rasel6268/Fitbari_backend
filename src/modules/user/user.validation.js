const { z } = require("zod");
const { ALL_ROLES } = require("../../constants/roles");

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});

const updateUserRoleSchema = z.object({
  role: z.enum(ALL_ROLES, {
    errorMap: () => ({ message: `Role must be one of: ${ALL_ROLES.join(", ")}` }),
  }),
});

const queryUsersSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  role: z.enum(ALL_ROLES).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

module.exports = {
  updateUserSchema,
  updateUserRoleSchema,
  queryUsersSchema,
};

