import { MESSAGES } from "./auth.constants.js";
import * as service from "./auth.service.js";
// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, phone, email, password } = req.validatedBody ?? req.body;

    const result = await service.registerUser({ name, phone, email, password });

    if (result.conflict) {
      return res.status(409).json({ success: false, message: result.message });
    }

    return res.status(201).json({
      success: true,
      message: MESSAGES.REGISTER_SUCCESS,
      data: {
        user:         result.user,
        accessToken:  result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody ?? req.body;

    const result = await service.loginUser({ email, password });

    if (result.unauthorized) {
      return res.status(401).json({ success: false, message: result.message });
    }
    if (result.forbidden) {
      return res.status(403).json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: MESSAGES.LOGIN_SUCCESS,
      data: {
        user:         result.user,
        accessToken:  result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    await service.logoutUser(req.user._id);

    return res.status(200).json({ success: true, message: MESSAGES.LOGOUT_SUCCESS });
  } catch (err) {
    next(err);
  }
};

// ─── Refresh token ────────────────────────────────────────────────────────────
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Refresh token is required" });
    }

    const result = await service.refreshAccessToken(token);

    if (result.unauthorized) {
      return res.status(401).json({ success: false, message: MESSAGES.INVALID_TOKEN });
    }

    return res.status(200).json({
      success: true,
      data: {
        accessToken:  result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Forgot password ──────────────────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.validatedBody ?? req.body;

    const result = await service.forgotPassword(email);

    return res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};

// ─── Reset password ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.validatedBody ?? req.body;

    const result = await service.resetPassword(token, password);

    if (result.unauthorized) {
      return res.status(401).json({ success: false, message: result.message });
    }

    return res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};
// ─── Google Auth ──────────────────────────────────────────────────────────────
export const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: "idToken is required" });
    }

    const result = await service.googleAuthUser(idToken);

    if (result.unauthorized) {
      return res.status(401).json({ success: false, message: result.message });
    }
    if (result.forbidden) {
      return res.status(403).json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: result.isNew ? MESSAGES.REGISTER_SUCCESS : MESSAGES.LOGIN_SUCCESS,
      data: {
        user:         result.user,
        accessToken:  result.accessToken,
        refreshToken: result.refreshToken,
        isNew:        result.isNew,
      },
    });
  } catch (err) {
    next(err);
  }
};
