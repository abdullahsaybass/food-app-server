// ─────────────────────────────────────────────
// 🏪 SHOP SERVICE
// ─────────────────────────────────────────────
import { SHOP_HOURS, SHOP_TIMEZONE, SHOP_MESSAGES } from "./shop.constants.js";
import { isWithinMaldives } from "../../utils/geo.utils.js";

const getCurrentHour = () => {
  const localTime = new Date().toLocaleString("en-US", {
    timeZone: SHOP_TIMEZONE,
    hour:     "numeric",
    hour12:   false,
  });
  return parseInt(localTime, 10);
};

const fmt = (h) => {
  const suffix  = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${suffix}`;
};

export const getShopStatus = (lat, lon) => {
  const hour = getCurrentHour();
  const open = hour >= SHOP_HOURS.open && hour < SHOP_HOURS.close;

  // 1. Check if shop is open
  if (!open) {
    return {
      available:   false,
      reason:      "closed",
      message:     SHOP_MESSAGES.CLOSED_HOURS,
      opensAt:     fmt(SHOP_HOURS.open),
      closesAt:    fmt(SHOP_HOURS.close),
      currentHour: hour,
    };
  }

  // 2. If GPS provided, confirm user is inside Maldives
  if (lat != null && lon != null) {
    if (!isWithinMaldives(lat, lon)) {
      return {
        available: false,
        reason:    "outside_maldives",
        message:   SHOP_MESSAGES.OUTSIDE_MALDIVES,
        opensAt:   fmt(SHOP_HOURS.open),
        closesAt:  fmt(SHOP_HOURS.close),
      };
    }
  }

  // 3. Open and within Maldives (or no location provided)
  return {
    available:   true,
    reason:      null,
    message:     SHOP_MESSAGES.OPEN,
    opensAt:     fmt(SHOP_HOURS.open),
    closesAt:    fmt(SHOP_HOURS.close),
    currentHour: hour,
  };
};