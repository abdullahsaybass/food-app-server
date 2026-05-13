import jwt from "jsonwebtoken";
import { HTTP, MESSAGES, ROLES } from "../modules/auth/auth.constants.js";
import * as repo from "../modules/auth/auth.repository.js";
import { UnauthorizedError, ForbiddenError } from "../utils/apiError.js";

// ─── protect — verify JWT ─────────────────────────────
export const protect = async (req, res, next) => {
  try {
    console.log("HEADERS:", req.headers);

    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError(MESSAGES.NO_TOKEN);
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN:", token);

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("DECODED:", decoded);

    } catch (err) {
      const message =
        err.name === "TokenExpiredError"
          ? MESSAGES.TOKEN_EXPIRED
          : MESSAGES.INVALID_TOKEN;

      throw new UnauthorizedError(message);
    }

    const user = await repo.findById(decoded.id);

    console.log("USER:", user);

    if (!user || !user.isActive) {
      throw new UnauthorizedError(MESSAGES.ACCOUNT_NOT_FOUND);
    }

    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
};

// ─── restrictTo — role guard ─────────────────────────
export const restrictTo = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return next(new ForbiddenError(MESSAGES.ACCESS_DENIED));
  }
  next();
};

// ─── Shorthand ───────────────────────────────────────
export const adminOnly = restrictTo(ROLES.ADMIN, ROLES.SUPERADMIN);
export const superAdminOnly = restrictTo(ROLES.SUPERADMIN);