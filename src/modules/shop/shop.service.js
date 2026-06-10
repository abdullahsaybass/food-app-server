// ─────────────────────────────────────────────
// 🏪 SHOP SERVICE
// ─────────────────────────────────────────────
import {
  SHOP_HOURS,
  SHOP_TIMEZONE,
  STORE_LOCATION,
  MAX_DELIVERY_KM,
  SHOP_MESSAGES,
} from "./shop.constants.js";

// ── Haversine formula — distance in km between two GPS points ─────────────────
export const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── Get current hour in shop's local timezone ─────────────────────────────────
const getCurrentHourInShopTimezone = () => {
  const now = new Date();
  // toLocaleString with timeZone gives us the local time string
  const localTime = now.toLocaleString("en-US", {
    timeZone: SHOP_TIMEZONE,
    hour:     "numeric",
    hour12:   false,
  });
  return parseInt(localTime, 10); // returns 0-23
};

// ── Is the shop open right now? ───────────────────────────────────────────────
export const isShopOpen = () => {
  const hour = getCurrentHourInShopTimezone();
  return hour >= SHOP_HOURS.open && hour < SHOP_HOURS.close;
};

// ── Full shop status — called by the status endpoint ─────────────────────────
// lat / lon are optional (sent by the frontend if available)
export const getShopStatus = (lat, lon) => {
  const hour = getCurrentHourInShopTimezone();
  const open = hour >= SHOP_HOURS.open && hour < SHOP_HOURS.close;

  // Format next open/close time nicely
  const fmt = (h) => {
    const suffix = h >= 12 ? "PM" : "AM";
    const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${display}:00 ${suffix}`;
  };

  // ── Not open ─────────────────────────────────────────────────────────────────
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

  // ── Open — now check distance if coords provided ──────────────────────────
  if (lat != null && lon != null) {
    const distanceKm = getDistanceKm(
      STORE_LOCATION.latitude,
      STORE_LOCATION.longitude,
      lat,
      lon
    );
    const withinRange = distanceKm <= MAX_DELIVERY_KM;

    if (!withinRange) {
      return {
        available:   false,
        reason:      "out_of_range",
        message:     `${SHOP_MESSAGES.OUTSIDE_RANGE} Your location is ${distanceKm.toFixed(1)} km away.`,
        distanceKm:  parseFloat(distanceKm.toFixed(1)),
        maxKm:       MAX_DELIVERY_KM,
        opensAt:     fmt(SHOP_HOURS.open),
        closesAt:    fmt(SHOP_HOURS.close),
      };
    }

    // Within range and open ✅
    return {
      available:   true,
      reason:      null,
      message:     SHOP_MESSAGES.OPEN,
      distanceKm:  parseFloat(distanceKm.toFixed(1)),
      maxKm:       MAX_DELIVERY_KM,
      opensAt:     fmt(SHOP_HOURS.open),
      closesAt:    fmt(SHOP_HOURS.close),
      currentHour: hour,
    };
  }

  // Open — no location provided (guest / location not yet fetched)
  return {
    available:   true,
    reason:      null,
    message:     SHOP_MESSAGES.OPEN,
    opensAt:     fmt(SHOP_HOURS.open),
    closesAt:    fmt(SHOP_HOURS.close),
    currentHour: hour,
  };
};
