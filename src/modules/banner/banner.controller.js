// ─────────────────────────────────────────────
// 🔥 BANNER CONTROLLER
// ─────────────────────────────────────────────
import asyncHandler from '../../utils/asyncHandler.js';
import * as bannerService from './banner.service.js';
import { toBannerDTO, toBannerListDTO } from './banner.mapper.js';
import { BANNER_MESSAGES } from './banner.constants.js';

// ─────────────────────────────────────────────
// POST /api/banners
// ─────────────────────────────────────────────
export const createBanner = asyncHandler(async (req, res) => {
  const banner = await bannerService.createBanner(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: BANNER_MESSAGES.CREATED,
    data:    toBannerDTO(banner),
  });
});

// ─────────────────────────────────────────────
// GET /api/banners
// ─────────────────────────────────────────────
export const listBanners = asyncHandler(async (req, res) => {
  const { banners, pagination } = await bannerService.getAllBanners(req.query);

  res.status(200).json({
    success: true,
    message: BANNER_MESSAGES.LIST_FETCHED,
    data:    toBannerListDTO(banners, pagination),
  });
});

// ─────────────────────────────────────────────
// GET /api/banners/live?position=home_top
// Public — returns only live banners for a position
// ─────────────────────────────────────────────
export const getLiveBanners = asyncHandler(async (req, res) => {
  const { position } = req.query;
  const banners = await bannerService.getLiveBannersByPosition(position);

  res.status(200).json({
    success: true,
    message: BANNER_MESSAGES.LIST_FETCHED,
    data:    banners.map(toBannerDTO),
  });
});

// ─────────────────────────────────────────────
// GET /api/banners/:id
// ─────────────────────────────────────────────
export const getBanner = asyncHandler(async (req, res) => {
  const banner = await bannerService.getBannerById(req.params.id);

  res.status(200).json({
    success: true,
    message: BANNER_MESSAGES.FETCHED,
    data:    toBannerDTO(banner),
  });
});

// ─────────────────────────────────────────────
// PUT /api/banners/:id
// ─────────────────────────────────────────────
export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await bannerService.updateBanner(req.params.id, req.body, req.user.id);

  res.status(200).json({
    success: true,
    message: BANNER_MESSAGES.UPDATED,
    data:    toBannerDTO(banner),
  });
});

// ─────────────────────────────────────────────
// PATCH /api/banners/:id/deactivate
// ─────────────────────────────────────────────
export const deactivateBanner = asyncHandler(async (req, res) => {
  await bannerService.softDeleteBanner(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: BANNER_MESSAGES.DELETED,
  });
});

// ─────────────────────────────────────────────
// DELETE /api/banners/:id
// ─────────────────────────────────────────────
export const deleteBanner = asyncHandler(async (req, res) => {
  await bannerService.deleteBanner(req.params.id);

  res.status(200).json({
    success: true,
    message: BANNER_MESSAGES.DELETED,
  });
});