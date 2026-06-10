// ─────────────────────────────────────────────
// 🏪 SHOP CONTROLLER
// ─────────────────────────────────────────────
import asyncHandler from "../../utils/asyncHandler.js";
import { getShopStatus } from "./shop.service.js";

// GET /api/shop/status?lat=4.17&lon=73.50
// No auth required — guests can call this on app open
export const shopStatus = asyncHandler(async (req, res) => {
  const lat = req.query.lat ? parseFloat(req.query.lat) : null;
  const lon = req.query.lon ? parseFloat(req.query.lon) : null;

  const status = getShopStatus(lat, lon);

  // Always 200 — the frontend reads status.available
  res.status(200).json({
    success: true,
    data:    status,
  });
});
