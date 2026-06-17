// modules/notification/deviceToken.model.js
import mongoose from "mongoose";

// ─────────────────────────────────────────────
// 🔥 DEVICE TOKEN MODEL
// Stores FCM push tokens per user/device so we
// can send order-status push notifications.
// ─────────────────────────────────────────────
const deviceTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    platform: {
      type: String,
      enum: ["ios", "android", "web"],
      default: "android",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

deviceTokenSchema.index({ user: 1, isActive: 1 });

const DeviceToken = mongoose.model("DeviceToken", deviceTokenSchema);
export default DeviceToken;
