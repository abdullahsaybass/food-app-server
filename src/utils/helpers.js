import crypto from "crypto";

// ─── Object utils ─────────────────────────────────────────────────────────
export const pick = (obj, keys) =>
  keys.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) acc[key] = obj[key];
    return acc;
  }, {});

export const omit = (obj, keys) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));

export const cleanObject = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null));

// ─── String utils ─────────────────────────────────────────────────────────
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

export const maskEmail = (email) => {
  const [local, domain] = email.split("@");
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(local.length - 2)}@${domain}`;
};

export const maskPhone = (phone) =>
  phone.slice(0, 4) + "****" + phone.slice(-4);

// ─── Token / Crypto utils ─────────────────────────────────────────────────
export const generateSecureToken = () =>
  crypto.randomBytes(32).toString("hex");

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const tokenExpiresAt = (minutes = 10) =>
  new Date(Date.now() + minutes * 60 * 1000);

// ─── Date utils ───────────────────────────────────────────────────────────
export const isExpired = (date) => new Date(date) < new Date();

export const msToHuman = (ms) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h) return `${h}h ${m % 60}m`;
  if (m) return `${m}m ${s % 60}s`;
  return `${s}s`;
};

// ─── Async utils ──────────────────────────────────────────────────────────
export const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));