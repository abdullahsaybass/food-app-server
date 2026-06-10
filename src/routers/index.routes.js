import express from "express";

import { authRouter }                    from "../modules/auth/auth.routes.js";
import { userRouter, adminUserRouter }   from "../modules/user/user.routes.js";
import productRouter                     from "../modules/product/product.routes.js";
import orderRouter                       from "../modules/order/order.routes.js";
import cartRouter                        from "../modules/cart/cart.routes.js";
import bannerRouter                      from "../modules/banner/banner.routes.js";
import couponRouter                      from "../modules/coupon/coupon.routes.js";
import pointsRouter                      from "../modules/points/points.routes.js";
import inventoryRouter                   from "../modules/inventory/inventory.routes.js";
import shopRouter                        from "../modules/shop/shop.routes.js";

const router = express.Router();

// ─── Shop status (public — no login needed) ───────────────────────────────────
router.use("/shop",        shopRouter);

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.use("/auth",        authRouter);

// ─── User ─────────────────────────────────────────────────────────────────────
router.use("/users",       userRouter);
router.use("/admin/users", adminUserRouter);

// ─── Products ─────────────────────────────────────────────────────────────────
router.use("/products",    productRouter);

// ─── Orders ───────────────────────────────────────────────────────────────────
router.use("/orders",      orderRouter);

// ─── Cart ─────────────────────────────────────────────────────────────────────
router.use("/cart",        cartRouter);

// ─── Banners ──────────────────────────────────────────────────────────────────
router.use("/banners",     bannerRouter);

// ─── Coupons ──────────────────────────────────────────────────────────────────
router.use("/coupons",     couponRouter);

// ─── Points (referral / purchase / invite) ────────────────────────────────────
router.use("/points",      pointsRouter);

// ─── Inventory (stock check / update) ────────────────────────────────────────
router.use("/inventory",   inventoryRouter);

export default router;