// modules/delivery-zone/delivery-zone.model.js
//
// Stores delivery charge rules per island / atoll.
//
// Examples:
//   city: "Malé",       atoll: "Kaafu",   charge: 20
//   city: "Addu City",  atoll: "Addu",    charge: 50
//   city: null,         atoll: "Haa Alif", charge: 80   ← whole-atoll fallback
//
// Lookup priority (in order.service.js):
//   1. Exact city + atoll match
//   2. Atoll-only match (city is null/blank in the zone)
//   3. defaultDeliveryCharge from order.constants.js

import mongoose from "mongoose";

const deliveryZoneSchema = new mongoose.Schema(
  {
    // Island / city name — e.g. "Malé", "Hulhumalé", "Addu City"
    // Leave null/blank to make this an atoll-level fallback rule.
    city: {
      type:    String,
      trim:    true,
      default: null,
    },

    // Atoll name — e.g. "Kaafu", "Addu", "Haa Alif"
    atoll: {
      type:     String,
      required: true,
      trim:     true,
    },

    // Delivery charge in MVR
    charge: {
      type:     Number,
      required: true,
      min:      0,
    },

    // Optional display label shown to customer — e.g. "Malé (Free)", "Outer Islands"
    label: {
      type:    String,
      trim:    true,
      default: null,
    },

    // Whether this zone is currently active
    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Unique per city+atoll combo (city can be null for atoll-level rules)
deliveryZoneSchema.index({ atoll: 1, city: 1 }, { unique: true, sparse: true });

const DeliveryZone = mongoose.model("DeliveryZone", deliveryZoneSchema);
export default DeliveryZone;