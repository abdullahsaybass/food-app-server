import express from "express";

import { authRouter }                    from "../modules/auth/auth.routes.js";
import { userRouter, adminUserRouter }   from "../modules/user/user.routes.js";
import productRouter                     from "../modules/product/product.routes.js";
import orderRouter                       from "../modules/order/order.routes.js";
import cartRouter                        from "../modules/cart/cart.routes.js";
import bannerRouter                      from "../modules/banner/banner.routes.js";
import couponRouter                      from "../modules/coupon/coupon.routes.js";
import inventoryRouter                   from "../modules/inventory/inventory.routes.js";
import shopRouter                        from "../modules/shop/shop.routes.js";
import categoryRouter                    from "../modules/category/category.routes.js";
import notificationRouter                from "../modules/notification/notification.routes.js";
import deliveryZoneRouter                from "../modules/delivery/deliveryzone.routes.js";
import invoiceRouter                     from "../modules/invoice/invoice.routes.js";

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

// ─── Categories ───────────────────────────────────────────────────────────────
router.use("/categories",  categoryRouter);

// ─── Orders ───────────────────────────────────────────────────────────────────
router.use("/orders",      orderRouter);

// ─── Cart ─────────────────────────────────────────────────────────────────────
router.use("/cart",        cartRouter);

// ─── Banners ──────────────────────────────────────────────────────────────────
router.use("/banners",     bannerRouter);

// ─── Coupons ──────────────────────────────────────────────────────────────────
router.use("/coupons",     couponRouter);

// ─── Points (referral / purchase / invite) ────────────────────────────────────

// ─── Invoices ─────────────────────────────────────────────────────────────────
router.use("/invoices", invoiceRouter);

// ─── Inventory (stock check / update) ────────────────────────────────────────
router.use("/inventory",   inventoryRouter);

// ─── Notifications (order updates, push tokens) ───────────────────────────────
router.use("/notifications", notificationRouter);

export default router;
