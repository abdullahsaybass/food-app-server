// modules/delivery-zone/delivery-zone.service.js

import DeliveryZone from "./deliveryzone.model.js";
import { DEFAULT_DELIVERY_CHARGE } from "../order/order.constants.js";
import { NotFoundError, BadRequestError } from "../../utils/apiError.js";

class DeliveryZoneService {
  // ── Admin: create a zone ──────────────────────────────────────────────────
  async createZone({ city, atoll, charge, label }) {
    const existing = await DeliveryZone.findOne({
      atoll: { $regex: new RegExp(`^${atoll}$`, "i") },
      city:  city ? { $regex: new RegExp(`^${city}$`, "i") } : { $in: [null, ""] },
    });
    if (existing) {
      throw new BadRequestError(
        `A delivery zone for "${city ? city + ", " : ""}${atoll}" already exists.`
      );
    }

    return await DeliveryZone.create({ city: city || null, atoll, charge, label: label || null });
  }

  // ── Admin: update a zone ──────────────────────────────────────────────────
  async updateZone(zoneId, updates) {
    const zone = await DeliveryZone.findById(zoneId);
    if (!zone) throw new NotFoundError("Delivery zone");

    const allowed = ["city", "atoll", "charge", "label", "isActive"];
    for (const key of allowed) {
      if (updates[key] !== undefined) zone[key] = updates[key];
    }

    return await zone.save();
  }

  // ── Admin: delete a zone ──────────────────────────────────────────────────
  async deleteZone(zoneId) {
    const zone = await DeliveryZone.findByIdAndDelete(zoneId);
    if (!zone) throw new NotFoundError("Delivery zone");
    return zone;
  }

  // ── Admin + public: list all zones ────────────────────────────────────────
  async listZones({ activeOnly = false } = {}) {
    const filter = activeOnly ? { isActive: true } : {};
    return await DeliveryZone.find(filter).sort({ atoll: 1, city: 1 });
  }

  // ── Core: resolve delivery charge for an address ─────────────────────────
  // Priority:
  //   1. Active zone matching both city AND atoll (most specific)
  //   2. Active zone matching atoll only (city null/blank in DB)
  //   3. DEFAULT_DELIVERY_CHARGE constant
  async resolveCharge({ city, atoll } = {}) {
    if (!city && !atoll) return DEFAULT_DELIVERY_CHARGE;

    // 1. City + atoll match
    if (city && atoll) {
      const cityZone = await DeliveryZone.findOne({
        isActive: true,
        atoll:    { $regex: new RegExp(`^${atoll}$`, "i") },
        city:     { $regex: new RegExp(`^${city}$`,  "i") },
      });
      if (cityZone) return cityZone.charge;
    }

    // 2. Atoll-only fallback
    if (atoll) {
      const atollZone = await DeliveryZone.findOne({
        isActive: true,
        atoll:    { $regex: new RegExp(`^${atoll}$`, "i") },
        city:     { $in: [null, ""] },
      });
      if (atollZone) return atollZone.charge;
    }

    // 3. Hard-coded default
    return DEFAULT_DELIVERY_CHARGE;
  }
}

export default new DeliveryZoneService();