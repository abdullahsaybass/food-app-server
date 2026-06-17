// modules/category/category.service.js
import categoryRepository from "./category.repository.js";
import { NotFoundError, ConflictError } from "../../utils/apiError.js";
import { CATEGORY_MESSAGES } from "./category.constants.js";

class CategoryService {
  async create(data, userId) {
    const existing = await categoryRepository.findByKey(
      data.key ?? data.name.toLowerCase().replace(/\s+/g, "_")
    );
    if (existing) throw new ConflictError(CATEGORY_MESSAGES.DUPLICATE);

    return categoryRepository.create({ ...data, createdBy: userId });
  }

  async getAll(activeOnly = false) {
    return categoryRepository.findAll({ activeOnly });
  }

  async getById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError(CATEGORY_MESSAGES.NOT_FOUND);
    return category;
  }

  async update(id, data, userId) {
    const category = await categoryRepository.updateById(id, {
      ...data,
      updatedBy: userId,
    });
    if (!category) throw new NotFoundError(CATEGORY_MESSAGES.NOT_FOUND);
    return category;
  }

  async remove(id) {
    const category = await categoryRepository.softDelete(id);
    if (!category) throw new NotFoundError(CATEGORY_MESSAGES.NOT_FOUND);
    return category;
  }
}

export default new CategoryService();
