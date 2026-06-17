// utils/geo.utils.js
// ─────────────────────────────────────────────────────────────────────────────
// 🔥 MALDIVES GEO BOUNDS
// Maldives spans roughly:
//   Latitude:  -0.92° to  7.42°
//   Longitude: 72.33° to 73.78°
// Used to reject any address/location outside the country.
// ─────────────────────────────────────────────────────────────────────────────

export const MALDIVES_BOUNDS = {
  minLat: -0.92,
  maxLat: 7.42,
  minLng: 72.33,
  maxLng: 73.78,
};

/**
 * Check whether a given lat/lng falls within the Maldives bounding box.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {boolean}
 */
export const isWithinMaldives = (latitude, longitude) => {
  if (latitude == null || longitude == null) return false;

  const { minLat, maxLat, minLng, maxLng } = MALDIVES_BOUNDS;

  return (
    latitude >= minLat &&
    latitude <= maxLat &&
    longitude >= minLng &&
    longitude <= maxLng
  );
};

/**
 * Validate a location object { latitude, longitude } + country string.
 * Returns true if the address can be considered "inside Maldives".
 *
 * Rules:
 *  - country must be "Maldives" / "MV" (case-insensitive) if provided
 *  - if GPS coords are provided, they must fall inside the bounding box too
 */
export const isMaldivesAddress = ({ country, location } = {}) => {
  const normalizedCountry = (country || "").trim().toLowerCase();

  if (normalizedCountry && !["maldives", "mv"].includes(normalizedCountry)) {
    return false;
  }

  if (location?.latitude != null && location?.longitude != null) {
    return isWithinMaldives(location.latitude, location.longitude);
  }

  return true;
};
