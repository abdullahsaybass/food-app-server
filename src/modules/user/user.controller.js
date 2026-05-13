import asyncHandler from "../../utils/asyncHandler.js";
import * as res_    from "../../utils/apiResponse.js";
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from "../../utils/apiError.js";
import { MESSAGES } from "./user.constants.js";
import * as svc     from "./user.service.js";
import { toPublicUser, toAdminUser, toAddressList } from "./user.mapper.js";
import User from "./user.model.js";

// ─── Result assertion helper ──────────────────────────────────────────────────
const assertResult = (result) => {
  if (!result)              return;
  if (result.conflict)      throw new ConflictError(result.message);
  if (result.notFound)      throw new NotFoundError(result.message);
  if (result.limitReached)  throw new BadRequestError(result.message);
  if (result.unauthorized)  throw new UnauthorizedError(result.message);
};

// ════════════════════════════════════════════════════════════════════════════════
// MY PROFILE (authenticated user)
// ════════════════════════════════════════════════════════════════════════════════
export const getMe = asyncHandler(async (req, res) => {
  const result = await svc.getMe(req.user.id);
  assertResult(result);

  res_.success(res, {
    message: "User fetched",
    data: { user: toPublicUser(result.user) },
  });
});

// ─── UPDATE PROFILE ─────────────────────────
export const updateMe = asyncHandler(async (req, res) => {
  const result = await svc.updateProfile(req.user.id, req.validatedBody);
  assertResult(result);

  res_.success(res, {
    message: "Profile updated",
    data: { user: toPublicUser(result.user) },
  });
});
export const deleteMe = asyncHandler(async (req, res) => {
  await svc.deactivateAccount(req.user._id);
  res_.success(res, { message: MESSAGES.ACCOUNT_DELETED });
});

// ─── Profile picture ──────────────────────────────────────────────────────────
// ✅ KEEP ONLY THIS — delete the duplicate
export const updateProfilePic = asyncHandler(async (req, res) => {
  const result = await svc.updateProfilePic(req.user._id, req.validatedBody);
  assertResult(result);

  res_.success(res, {
    message: MESSAGES.PROFILE_PIC_UPDATED,
    data:    { user: toPublicUser(result.user) },
  });
});

export const removeProfilePic = asyncHandler(async (req, res) => {
  const result = await svc.removeProfilePic(req.user._id);
  assertResult(result);

  res_.success(res, {
    message: MESSAGES.PROFILE_PIC_REMOVED,
    data:    { user: toPublicUser(result.user) },
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// ADDRESSES
// ════════════════════════════════════════════════════════════════════════════════

export const addAddress = asyncHandler(async (req, res) => {
  const result = await svc.addAddress(req.user._id, req.validatedBody);
  assertResult(result);

  res_.created(res, {
    message: MESSAGES.ADDRESS_ADDED,
    data:    { addresses: toAddressList(result.addresses) },
  });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const result = await svc.updateAddress(
    req.user._id,
    req.params.addressId,
    req.validatedBody
  );
  assertResult(result);

  res_.success(res, {
    message: MESSAGES.ADDRESS_UPDATED,
    data:    { addresses: toAddressList(result.addresses) },
  });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const result = await svc.deleteAddress(req.user._id, req.params.addressId);
  assertResult(result);

  res_.success(res, {
    message: MESSAGES.ADDRESS_DELETED,
    data:    { addresses: toAddressList(result.addresses) },
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// ADMIN
// ════════════════════════════════════════════════════════════════════════════════

export const getAllUsers = asyncHandler(async (req, res) => {
  const result = await svc.getAllUsers(req.query.role);

  res_.success(res, {
    message: MESSAGES.USERS_FETCHED,
    data:    { users: result.users.map(toAdminUser) },
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const result = await svc.getUserById(req.params.id);
  assertResult(result);

  res_.success(res, {
    message: MESSAGES.USER_FETCHED,
    data:    { user: toAdminUser(result.user) },
  });
});

export const adminUpdateUser = asyncHandler(async (req, res) => {
  const result = await svc.adminUpdateUser(req.params.id, req.validatedBody);
  assertResult(result);

  res_.success(res, {
    message: MESSAGES.USER_UPDATED,
    data:    { user: toAdminUser(result.user) },
  });
});

export const adminDeleteUser = asyncHandler(async (req, res) => {
  const result = await svc.adminDeleteUser(req.params.id);
  assertResult(result);

  res_.success(res, { message: MESSAGES.USER_DELETED });
});

export const seedAdmin = asyncHandler(async (req, res) => {
  const key = req.headers["x-seed-key"];

  if (key !== process.env.SEED_ADMIN_KEY) {
    throw new UnauthorizedError("Unauthorized");
  }

  // 👉 single admin per request
  const result = await svc.seedAdmin(req.body);

  res.status(200).json({
    success: true,
    message: result.message || "Admin created",
    data: result.user || null,
  });
});