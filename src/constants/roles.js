/**
 * Administrative Staff & Store Governance Roles
 *
 * NOTE: Customers / Shoppers NEVER authenticate or create accounts in Fit Bari.
 * All shopping, cart, checkout, and order tracking operations are purely guest-based.
 * Authentication exists exclusively for administrative staff (inventory, orders, catalog management).
 */
const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
};

const ALL_ROLES = Object.values(ROLES);

module.exports = {
  ROLES,
  ALL_ROLES,
};

