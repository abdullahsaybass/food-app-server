// ─────────────────────────────────────────────
// 🔥 POINTS ROUTES
// ─────────────────────────────────────────────
import { Router } from 'express';
import { protect, adminOnly } from '../../middleware/auth.middleware.js';
import {
  validateAdminCredit,
  validateAdminDebit,
  validateInviteBonus,
  validateRedeemCheck,
  validateHistoryQuery,
  validateUpdateConfig,
} from './points.validator.js';
import * as ctrl from './points.controller.js';

const router = Router();

// ─────────────────────────────────────────────
// USER ROUTES  (any logged-in user)
// ─────────────────────────────────────────────

// GET  /api/points/wallet          → my balance + referral code
router.get('/wallet',          protect, ctrl.getMyWallet);

// GET  /api/points/history         → my transaction history
router.get('/history',         protect, validateHistoryQuery, ctrl.getMyHistory);

// POST /api/points/redeem/check    → preview discount before placing order
router.post('/redeem/check',   protect, validateRedeemCheck, ctrl.checkRedeem);

// ─────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────

// GET  /api/points/admin/config          → view points config
router.get('/admin/config',                     protect, adminOnly, ctrl.getConfig);

// PUT  /api/points/admin/config          → update points config
router.put('/admin/config',                     protect, adminOnly, validateUpdateConfig, ctrl.updateConfig);

// GET  /api/points/admin/wallet/:userId  → view any user's wallet
router.get('/admin/wallet/:userId',             protect, adminOnly, ctrl.getUserWallet);

// GET  /api/points/admin/history/:userId → view any user's transaction history
router.get('/admin/history/:userId',            protect, adminOnly, validateHistoryQuery, ctrl.getUserHistory);

// POST /api/points/admin/credit/:userId  → manually credit points
router.post('/admin/credit/:userId',            protect, adminOnly, validateAdminCredit, ctrl.adminCredit);

// POST /api/points/admin/debit/:userId   → manually debit points
router.post('/admin/debit/:userId',             protect, adminOnly, validateAdminDebit, ctrl.adminDebit);

// POST /api/points/admin/invite/:userId  → award invite bonus
router.post('/admin/invite/:userId',            protect, adminOnly, validateInviteBonus, ctrl.adminInviteBonus);

export default router;