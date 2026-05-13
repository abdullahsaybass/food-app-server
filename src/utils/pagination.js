import { PAGINATION } from "./constants.js";

// ─── Parse pagination params ──────────────────────────────────────────────
export const parsePagination = (query = {}) => {
  const page = Math.max(
    1,
    parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE
  );

  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(
      1,
      parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT
    )
  );

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// ─── Build pagination meta ────────────────────────────────────────────────
export const buildPaginationMeta = ({ total, page, limit }) => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});

// ─── Parse sort ───────────────────────────────────────────────────────────
export const parseSort = (sortQuery) => {
  if (!sortQuery) return { createdAt: -1 };

  return sortQuery.split(",").reduce((acc, part) => {
    const [field, dir] = part.trim().split(":");
    if (field) acc[field] = dir?.toLowerCase() === "asc" ? 1 : -1;
    return acc;
  }, {});
};

// ─── Paginate (main function) ─────────────────────────────────────────────
export const paginate = async (
  Model,
  query,
  { filter = {}, select = "-__v", populate = null } = {}
) => {
  const { page, limit, skip } = parsePagination(query);
  const sort = parseSort(query.sort);

  const [data, total] = await Promise.all([
    Model.find(filter)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate || []),

    Model.countDocuments(filter),
  ]);

  return {
    data,
    pagination: buildPaginationMeta({ total, page, limit }),
  };
};