// ─────────────────────────────────────────────
// 🏪 SHOP ROUTES
// ─────────────────────────────────────────────
import express from "express";
import { shopStatus } from "./shop.controller.js";

const shopRouter = express.Router();

// GET /api/shop/status
// Public — no login needed, called on every app open
shopRouter.get("/status", shopStatus);

export default shopRouter;
