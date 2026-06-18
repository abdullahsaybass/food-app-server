import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,

  MONGO_URI: process.env.MONGO_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  REDIS: {
    HOST: process.env.REDIS_HOST || "localhost",
    PORT: process.env.REDIS_PORT || 6379,
  },

  // ── Firebase Cloud Messaging (push notifications) ───────────────────────────
  FIREBASE: {
    // Full service account JSON as a single-line string (set in env vars)
    SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON || null,
    // OR path to a service account JSON file on disk
    SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || null,
  },
};
