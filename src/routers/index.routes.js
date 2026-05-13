import express from "express";

import { authRouter }                    from "../modules/auth/auth.routes.js";
import { userRouter, adminUserRouter }   from "../modules/user/user.routes.js";
import productRouter                     from "../modules/product/product.routes.js";
import orderRouter                       from "../modules/order/order.routes.js";
import cartRouter                        from "../modules/cart/cart.routes.js";

const router = express.Router();

// ─── Auth (register, login, logout, refresh, forgot/reset password) ───────────
router.use("/auth",        authRouter);

// ─── User (my profile, addresses, profile pic) ────────────────────────────────
router.use("/users",       userRouter);

// ─── Admin user management ────────────────────────────────────────────────────
router.use("/admin/users", adminUserRouter);

// ─── Products ─────────────────────────────────────────────────────────────────
router.use("/products",    productRouter);


router.use("/orders",      orderRouter);

router.use("/cart",        cartRouter);
export default router;