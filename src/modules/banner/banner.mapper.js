// ─────────────────────────────────────────────
// 🔥 BANNER MAPPER
// ─────────────────────────────────────────────

export const toBannerDTO = (banner) => {
  if (!banner) return null;

  const b = banner.toObject ? banner.toObject() : banner;

  return {
    id:          b._id,

    // ───────── Basic Info ─────────
    title:       b.title,
    subtitle:    b.subtitle   ?? '',
    description: b.description ?? '',

    // ───────── Media ─────────
    type:        b.type,
    image:       b.image ?? null,

    // ───────── Link ─────────
    linkUrl:     b.linkUrl  ?? '',
    linkText:    b.linkText ?? '',

    // ───────── Placement ─────────
    position:    b.position,
    sortOrder:   b.sortOrder ?? 0,

    // ───────── Scheduling ─────────
    startDate:   b.startDate ?? null,
    endDate:     b.endDate   ?? null,

    // ───────── Status ─────────
    isActive:    b.isActive,
    isDeleted:   b.isDeleted,
    isLive:      b.isLive ?? false,

    // ───────── Audit ─────────
    createdBy:   b.createdBy,
    updatedBy:   b.updatedBy ?? null,
    createdAt:   b.createdAt,
    updatedAt:   b.updatedAt,
  };
};

export const toBannerListDTO = (banners, pagination) => ({
  banners:    banners.map(toBannerDTO),
  pagination,
});