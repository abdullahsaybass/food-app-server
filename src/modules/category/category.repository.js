// modules/category/category.repository.js
import Category from "./category.model.js";

class CategoryRepository {
  create(data) {
    return Category.create(data);
  }

  findById(id) {
    return Category.findOne({ _id: id, isDeleted: false });
  }

  findByKey(key) {
    return Category.findOne({ key, isDeleted: false });
  }

  findAll({ activeOnly = false } = {}) {
    const filter = { isDeleted: false };
    if (activeOnly) filter.isActive = true;

    return Category.find(filter).sort({ sortOrder: 1, name: 1 });
  }

  async updateById(id, updateData) {
    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) return null;

    Object.assign(category, updateData);
    return category.save();
  }

  async softDelete(id) {
    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) return null;

    category.isDeleted = true;
    category.isActive  = false;
    return category.save();
  }
}

export default new CategoryRepository();
