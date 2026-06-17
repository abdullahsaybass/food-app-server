// services/notification/fcm.service.js
import fs from "fs";
import admin from "firebase-admin";
import { ENV } from "../../config/env.js";
import logger from "../../infrastructure/logger/logger.js";

// ─────────────────────────────────────────────────────────────────────────────
// 🔥 FIREBASE ADMIN INIT
// Requires FIREBASE_SERVICE_ACCOUNT (JSON string) or
// FIREBASE_SERVICE_ACCOUNT_PATH (path to JSON file) in env.
// ─────────────────────────────────────────────────────────────────────────────
let initialized = false;

const initFirebase = () => {
  if (initialized) return;

  try {
    let credential;

    if (ENV.FIREBASE.SERVICE_ACCOUNT_JSON) {
      credential = admin.credential.cert(
        JSON.parse(ENV.FIREBASE.SERVICE_ACCOUNT_JSON)
      );
    } else if (ENV.FIREBASE.SERVICE_ACCOUNT_PATH) {
      credential = admin.credential.cert(
        JSON.parse(fs.readFileSync(ENV.FIREBASE.SERVICE_ACCOUNT_PATH, "utf-8"))
      );
    } else {
      logger.warn("[FCM] No Firebase service account configured — push notifications disabled.");
      return;
    }

    admin.initializeApp({ credential });
    initialized = true;
    logger.info("[FCM] Firebase Admin initialized.");
  } catch (err) {
    logger.error(`[FCM] Failed to initialize Firebase Admin: ${err.message}`);
  }
};

class FcmService {
  constructor() {
    initFirebase();
  }

  /**
   * Send a push notification to a single device token.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async sendToToken(token, { title, body, data = {} }) {
    if (!initialized) return { success: false, error: "FCM not initialized" };

    try {
      await admin.messaging().send({
        token,
        notification: { title, body },
        data: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        ),
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } },
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message, code: err.code };
    }
  }

  /**
   * Send a push notification to multiple device tokens.
   * Returns the list of tokens that are invalid/unregistered so the
   * caller can deactivate them.
   */
  async sendToTokens(tokens = [], { title, body, data = {} }) {
    if (!initialized || !tokens.length) {
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default" } } },
    });

    const invalidTokens = [];
    response.responses.forEach((res, idx) => {
      if (!res.success) {
        const code = res.error?.code;
        if (
          code === "messaging/invalid-registration-token" ||
          code === "messaging/registration-token-not-registered"
        ) {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      invalidTokens,
    };
  }
}

export default new FcmService();
