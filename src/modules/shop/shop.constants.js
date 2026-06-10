// ─────────────────────────────────────────────
// 🏪 SHOP CONSTANTS
// Change these values to match your shop
// ─────────────────────────────────────────────

// ── Working hours (24-hour format, your local timezone) ──────────────────────
export const SHOP_HOURS = {
  open:  7,   // 7 AM
  close: 21,  // 9 PM
};

// ── Timezone ──────────────────────────────────────────────────────────────────
// Find yours at: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
// Examples: "Asia/Colombo", "Asia/Dubai", "Indian/Maldives"
export const SHOP_TIMEZONE = "Indian/Maldives"; // UTC+5

// ── Your shop's GPS location ──────────────────────────────────────────────────
// How to find: open Google Maps → long press your shop → copy the numbers shown
export const STORE_LOCATION = {
  latitude:  4.1755,   // ← replace with your latitude
  longitude: 73.5093,  // ← replace with your longitude
};

// ── Max delivery distance in km ───────────────────────────────────────────────
export const MAX_DELIVERY_KM = 30;

// ── Response messages ─────────────────────────────────────────────────────────
export const SHOP_MESSAGES = {
  OPEN:             "We are open and accepting orders!",
  CLOSED_HOURS:     `We are closed right now. We are open from 7:00 AM to 9:00 PM.`,
  OUTSIDE_RANGE:    `Sorry, we only deliver within ${MAX_DELIVERY_KM} km of our store.`,
  NO_LOCATION:      "Location not provided — distance check skipped.",
};
