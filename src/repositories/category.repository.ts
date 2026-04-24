import { Op } from "sequelize";
import Category from "../database/models/Category";
import type { CategoryInstance } from "../database/models/Category";
import type {
  CreateCategoryInput,
  ICategoryRepository,
} from "../interfaces/catalog/category.repository.interface";

class CategoryRepository implements ICategoryRepository {
  async create(data: CreateCategoryInput): Promise<CategoryInstance> {
    return Category.create({
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
    });
  }

  async findById(id: number): Promise<CategoryInstance | null> {
    return Category.findByPk(id);
  }

  async findBySlug(slug: string): Promise<CategoryInstance | null> {
    return Category.findOne({ where: { slug } });
  }

  async findAll(search?: string): Promise<CategoryInstance[]> {
    const where = search
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { slug: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};
    return Category.findAll({
      where,
      order: [["name", "ASC"]],
    });
  }

  async update(id: number, data: Partial<CreateCategoryInput>): Promise<[number]> {
    return Category.update(data, { where: { id } });
  }

  async delete(id: number): Promise<number> {
    return Category.destroy({ where: { id } });
  }
}

export default new CategoryRepository();
