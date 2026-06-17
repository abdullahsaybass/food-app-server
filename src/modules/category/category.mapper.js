// modules/category/category.mapper.js

export const mapCategory = (category) => {
  if (!category) return null;

  return {
    id:          category._id,
    name:        category.name,
    slug:        category.slug,
    key:         category.key,
    description: category.description ?? "",
    image:       category.image?.url ? category.image : null,
    banner:      category.banner?.url ? category.banner : null,
    sortOrder:   category.sortOrder,
    isActive:    category.isActive,
    createdAt:   category.createdAt,
    updatedAt:   category.updatedAt,
  };
};

export const mapCategoryList = (categories = []) => categories.map(mapCategory);
