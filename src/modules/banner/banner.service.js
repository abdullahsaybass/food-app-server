// ─────────────────────────────────────────────
// 🔥 BANNER SERVICE
// ─────────────────────────────────────────────
import * as repo from './banner.repository.js';
import { BANNER_MESSAGES, DEFAULT_PAGE, DEFAULT_LIMIT } from './banner.constants.js';
import { NotFoundError } from '../../utils/apiError.js';
// ✅ fix
import { buildPaginationMeta } from '../../utils/pagination.js';

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────
export const createBanner = async (data, userId) => {
  const banner = await repo.create({ ...data, createdBy: userId });
  return banner;
};

// ─────────────────────────────────────────────
// GET ONE
// ─────────────────────────────────────────────
export const getBannerById = async (id) => {
  const banner = await repo.findById(id);
  if (!banner) throw new NotFoundError('Banner');
  return banner;
};

// ─────────────────────────────────────────────
// GET ALL  (admin — paginated)
// ─────────────────────────────────────────────
export const getAllBanners = async (query = {}) => {
  const {
    page     = DEFAULT_PAGE,
    limit    = DEFAULT_LIMIT,
    position,
    isActive,
    sortBy    = 'sortOrder',
    sortOrder = 'asc',
  } = query;

  const filter = {};
  if (position !== undefined) filter.position = position;
  if (isActive  !== undefined) filter.isActive  = isActive;

  const sort  = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip  = (page - 1) * limit;

  const { banners, total } = await repo.findAll({ filter, sort, skip, limit });

  return {
    banners,
    pagination: buildPaginationMeta({ page, limit, total }),
  };
};

// ─────────────────────────────────────────────
// GET LIVE by position  (mobile/frontend)
// ─────────────────────────────────────────────
export const getLiveBannersByPosition = async (position) => {
  return repo.findLiveByPosition(position);
};

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────
export const updateBanner = async (id, data, userId) => {
  const banner = await repo.updateById(id, { ...data, updatedBy: userId });
  if (!banner) throw new NotFoundError('Banner');
  return banner;
};

// ─────────────────────────────────────────────
// SOFT DELETE
// ─────────────────────────────────────────────
export const softDeleteBanner = async (id, userId) => {
  const banner = await repo.softDeleteById(id, userId);
  if (!banner) throw new NotFoundError('Banner');
  return banner;
};

// ─────────────────────────────────────────────
// HARD DELETE
// ─────────────────────────────────────────────
export const deleteBanner = async (id) => {
  const banner = await repo.deleteById(id);
  if (!banner) throw new NotFoundError('Banner');
};