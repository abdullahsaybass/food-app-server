import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from "./auth.validator.js";
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  googleAuth,
} from "./auth.controller.js";

export const authRouter = express.Router();

// ─── Public ───────────────────────────────────────────────────────────────────
authRouter.post("/register",        validateRegister,       register);
authRouter.post("/login",           validateLogin,          login);
authRouter.post("/refresh-token",                           refreshToken);
authRouter.post("/forgot-password", validateForgotPassword, forgotPassword);
authRouter.post("/reset-password",  validateResetPassword,  resetPassword);
authRouter.post("/google",                                  googleAuth);

// ─── Protected ────────────────────────────────────────────────────────────────
authRouter.post("/logout", protect, logout);