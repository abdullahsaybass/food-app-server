// modules/delivery-zone/delivery-zone.routes.js

import express from "express";
import deliveryZoneService from "./deliveryzone.service.js";
import asyncHandler        from "../../utils/asyncHandler.js";
import * as respond        from "../../utils/apiResponse.js";
import { protect, adminOnly } from "../../middleware/auth.middleware.js";

const router = express.Router();

// ── Public: active zones list ─────────────────────────────────────────────────
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const zones = await deliveryZoneService.listZones({ activeOnly: true });
    respond.success(res, { message: "Delivery zones fetched.", data: zones });
  })
);

// ── Public: resolve charge for a city/atoll ───────────────────────────────────
router.post(
  "/resolve",
  asyncHandler(async (req, res) => {
    const { city, atoll } = req.body;
    const charge = await deliveryZoneService.resolveCharge({ city, atoll });
    respond.success(res, { message: "Delivery charge resolved.", data: { charge } });
  })
);

// ── Admin: list all zones ─────────────────────────────────────────────────────
router.get(
  "/admin",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const zones = await deliveryZoneService.listZones({ activeOnly: false });
    respond.success(res, { message: "All delivery zones fetched.", data: zones });
  })
);

// ── Admin: create zone ────────────────────────────────────────────────────────
router.post(
  "/admin",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { city, atoll, charge, label } = req.body;
    if (!atoll || charge == null) {
      return respond.badRequest(res, "atoll and charge are required.");
    }
    const zone = await deliveryZoneService.createZone({ city, atoll, charge, label });
    respond.created(res, { message: "Delivery zone created.", data: zone });
  })
);

// ── Admin: update zone ────────────────────────────────────────────────────────
router.patch(
  "/admin/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const zone = await deliveryZoneService.updateZone(req.params.id, req.body);
    respond.success(res, { message: "Delivery zone updated.", data: zone });
  })
);

// ── Admin: delete zone ────────────────────────────────────────────────────────
router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    await deliveryZoneService.deleteZone(req.params.id);
    respond.success(res, { message: "Delivery zone deleted." });
  })
);

export default router;