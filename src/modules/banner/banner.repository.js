// ─────────────────────────────────────────────
// 🔥 BANNER REPOSITORY
// ─────────────────────────────────────────────
import Banner from './banner.model.js';

// CREATE
export const create = (data) => Banner.create(data);

// FIND BY ID  (exclude soft-deleted)
export const findById = (id) =>
  Banner.findOne({ _id: id, isDeleted: false });

// FIND ALL  (paginated + filtered)
export const findAll = async ({ filter = {}, sort, skip, limit }) => {
  const finalFilter = { ...filter, isDeleted: false };

  const [banners, total] = await Promise.all([
    Banner.find(finalFilter).sort(sort).skip(skip).limit(limit),
    Banner.countDocuments(finalFilter),
  ]);

  return { banners, total };
};

// FIND LIVE BANNERS by position  (for mobile/frontend consumers)
export const findLiveByPosition = (position) => {
  const now = new Date();
  return Banner.find({
    position,
    isActive:  true,
    isDeleted: false,
    $or: [
      { startDate: null },
      { startDate: { $lte: now } },
    ],
    $and: [
      {
        $or: [
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ],
  }).sort({ sortOrder: 1 });
};

// UPDATE
export const updateById = (id, data) =>
  Banner.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true, runValidators: true }
  );

// SOFT DELETE
export const softDeleteById = (id, updatedBy) =>
  Banner.findByIdAndUpdate(
    id,
    { $set: { isActive: false, isDeleted: true, updatedBy } },
    { new: true }
  );

// HARD DELETE
export const deleteById = (id) => Banner.findByIdAndDelete(id);