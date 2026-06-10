// ─────────────────────────────────────────────
// 🔥 COUPON REPOSITORY
// ─────────────────────────────────────────────
import Coupon from './coupon.model.js';

// CREATE
export const create = (data) => Coupon.create(data);

// FIND BY ID  (exclude soft-deleted)
export const findById = (id) =>
  Coupon.findOne({ _id: id, isDeleted: false });

// FIND BY CODE  (case-insensitive, exclude soft-deleted)
export const findByCode = (code) =>
  Coupon.findOne({ code: code.toUpperCase(), isDeleted: false });

// FIND ALL  (paginated + filtered)
export const findAll = async ({ filter = {}, sort, skip, limit }) => {
  const finalFilter = { ...filter, isDeleted: false };

  const [coupons, total] = await Promise.all([
    Coupon.find(finalFilter).sort(sort).skip(skip).limit(limit),
    Coupon.countDocuments(finalFilter),
  ]);

  return { coupons, total };
};

// UPDATE
export const updateById = (id, data) =>
  Coupon.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true, runValidators: true }
  );

// INCREMENT usedCount + push to userUsage
export const recordUsage = (id, userId) =>
  Coupon.findByIdAndUpdate(
    id,
    {
      $inc: { usedCount: 1 },
      $push: {
        userUsage: { user: userId, count: 1 },
      },
    },
    { new: true }
  );

// Or increment existing user's count if already used
export const incrementUserUsage = async (id, userId) => {
  const existing = await Coupon.findOne({
    _id: id,
    'userUsage.user': userId,
  });

  if (existing) {
    return Coupon.findOneAndUpdate(
      { _id: id, 'userUsage.user': userId },
      { $inc: { usedCount: 1, 'userUsage.$.count': 1 } },
      { new: true }
    );
  }

  return Coupon.findByIdAndUpdate(
    id,
    {
      $inc:  { usedCount: 1 },
      $push: { userUsage: { user: userId, count: 1 } },
    },
    { new: true }
  );
};

// SOFT DELETE
export const softDeleteById = (id, updatedBy) =>
  Coupon.findByIdAndUpdate(
    id,
    { $set: { isActive: false, isDeleted: true, updatedBy } },
    { new: true }
  );

// HARD DELETE
export const deleteById = (id) => Coupon.findByIdAndDelete(id);