// ─────────────────────────────────────────────
// 🔥 POINTS CONTROLLER
// ─────────────────────────────────────────────
import asyncHandler from '../../utils/asyncHandler.js';
import * as pointsService from './points.service.js';
import { toWalletDTO, toTransactionDTO, toConfigDTO } from './points.mapper.js';
import { POINTS_MESSAGES } from './points.constants.js';

// ─────────────────────────────────────────────
// USER — GET /api/points/wallet
// ─────────────────────────────────────────────
export const getMyWallet = asyncHandler(async (req, res) => {
  const wallet = await pointsService.getWallet(req.user.id);

  res.status(200).json({
    success: true,
    message: POINTS_MESSAGES.BALANCE_FETCHED,
    data:    toWalletDTO(wallet),
  });
});

// ─────────────────────────────────────────────
// USER — GET /api/points/history
// ─────────────────────────────────────────────
export const getMyHistory = asyncHandler(async (req, res) => {
  const { transactions, pagination } = await pointsService.getHistory(
    req.user.id,
    req.query
  );

  res.status(200).json({
    success: true,
    message: POINTS_MESSAGES.HISTORY_FETCHED,
    data: {
      transactions: transactions.map(toTransactionDTO),
      pagination,
    },
  });
});

// ─────────────────────────────────────────────
// USER — POST /api/points/redeem/check
// Validate at checkout — does NOT deduct yet
// Body: { orderTotal, requestedPoints? }
// ─────────────────────────────────────────────
export const checkRedeem = asyncHandler(async (req, res) => {
  const { orderTotal, requestedPoints } = req.body;
  const result = await pointsService.validateRedeem(
    req.user.id,
    orderTotal,
    requestedPoints
  );

  res.status(200).json({
    success: true,
    message: 'Points redemption preview',
    data:    result,
  });
});

// ─────────────────────────────────────────────
// ADMIN — GET /api/points/admin/wallet/:userId
// ─────────────────────────────────────────────
export const getUserWallet = asyncHandler(async (req, res) => {
  const wallet = await pointsService.getWallet(req.params.userId);

  res.status(200).json({
    success: true,
    message: POINTS_MESSAGES.BALANCE_FETCHED,
    data:    toWalletDTO(wallet),
  });
});

// ─────────────────────────────────────────────
// ADMIN — GET /api/points/admin/history/:userId
// ─────────────────────────────────────────────
export const getUserHistory = asyncHandler(async (req, res) => {
  const { transactions, pagination } = await pointsService.getHistory(
    req.params.userId,
    req.query
  );

  res.status(200).json({
    success: true,
    message: POINTS_MESSAGES.HISTORY_FETCHED,
    data: {
      transactions: transactions.map(toTransactionDTO),
      pagination,
    },
  });
});

// ─────────────────────────────────────────────
// ADMIN — POST /api/points/admin/credit/:userId
// Body: { points, note? }
// ─────────────────────────────────────────────
export const adminCredit = asyncHandler(async (req, res) => {
  const { points, note } = req.body;
  const wallet = await pointsService.adminCreditPoints(
    req.params.userId,
    points,
    note,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: POINTS_MESSAGES.CREDITED,
    data:    toWalletDTO(wallet),
  });
});

// ─────────────────────────────────────────────
// ADMIN — POST /api/points/admin/debit/:userId
// Body: { points, note? }
// ─────────────────────────────────────────────
export const adminDebit = asyncHandler(async (req, res) => {
  const { points, note } = req.body;
  const wallet = await pointsService.adminDebitPoints(
    req.params.userId,
    points,
    note,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: POINTS_MESSAGES.DEBITED,
    data:    toWalletDTO(wallet),
  });
});

// ─────────────────────────────────────────────
// ADMIN — POST /api/points/admin/invite/:userId
// Body: { points?, note? }
// ─────────────────────────────────────────────
export const adminInviteBonus = asyncHandler(async (req, res) => {
  const { points, note } = req.body;
  const wallet = await pointsService.awardInviteBonus(
    req.params.userId,
    req.user.id,
    points,
    note
  );

  res.status(200).json({
    success: true,
    message: POINTS_MESSAGES.CREDITED,
    data:    toWalletDTO(wallet),
  });
});

// ─────────────────────────────────────────────
// ADMIN — GET /api/points/admin/config
// ─────────────────────────────────────────────
export const getConfig = asyncHandler(async (req, res) => {
  const config = await pointsService.getConfig();

  res.status(200).json({
    success: true,
    message: POINTS_MESSAGES.CONFIG_FETCHED,
    data:    toConfigDTO(config),
  });
});

// ─────────────────────────────────────────────
// ADMIN — PUT /api/points/admin/config
// ─────────────────────────────────────────────
export const updateConfig = asyncHandler(async (req, res) => {
  const config = await pointsService.updateConfig(req.body, req.user.id);

  res.status(200).json({
    success: true,
    message: POINTS_MESSAGES.CONFIG_UPDATED,
    data:    toConfigDTO(config),
  });
});