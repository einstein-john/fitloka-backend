import { Op } from "sequelize";
import Product from "../database/models/Product";
import type { ProductInstance } from "../database/models/Product";
import Category from "../database/models/Category";
import Inventory from "../database/models/Inventory";
import Image from "../database/models/Image";
import type {
  CreateProductInput,
  IProductRepository,
} from "../interfaces/catalog/product.repository.interface";

class ProductRepository implements IProductRepository {
  async create(data: CreateProductInput): Promise<ProductInstance> {
    return Product.create({
      categoryId: data.categoryId,
      name: data.name,
      sku: data.sku,
      description: data.description ?? null,
      price: String(data.price),
      status: data.status ?? "ACTIVE",
    });
  }

  async findById(id: number): Promise<ProductInstance | null> {
    return Product.findByPk(id, {
      include: [
        { model: Category, as: "category", required: false },
        { model: Inventory, as: "inventory", required: false },
        {
          model: Image,
          as: "images",
          through: { attributes: ["id", "sortOrder", "isPrimary"] },
          required: false,
        },
      ],
    });
  }

  async findBySku(sku: string): Promise<ProductInstance | null> {
    return Product.findOne({ where: { sku } });
  }

  async findAll(options: {
    categoryId?: number;
    search?: string;
    limit: number;
    offset: number;
  }): Promise<{ rows: ProductInstance[]; count: number }> {
    const and: object[] = [];
    if (options.categoryId) {
      and.push({ categoryId: options.categoryId });
    }
    if (options.search) {
      and.push({
        [Op.or]: [
          { name: { [Op.iLike]: `%${options.search}%` } },
          { sku: { [Op.iLike]: `%${options.search}%` } },
        ],
      });
    }
    const where = and.length ? { [Op.and]: and } : {};
    return Product.findAndCountAll({
      where,
      limit: options.limit,
      offset: options.offset,
      order: [["createdAt", "DESC"]],
      include: [
        { model: Category, as: "category", required: false },
        { model: Inventory, as: "inventory", required: false },
        {
          model: Image,
          as: "images",
          through: { attributes: ["id", "sortOrder", "isPrimary"] },
          required: false,
        },
      ],
    });
  }

  async update(id: number, data: Partial<CreateProductInput>): Promise<[number]> {
    const patch: Record<string, unknown> = { ...data };
    if (data.price !== undefined) {
      patch.price = String(data.price);
    }
    const [affected] = await Product.update(patch as never, { where: { id } });
    return [affected];
  }

  async delete(id: number): Promise<number> {
    return Product.destroy({ where: { id } });
  }
}

export default new ProductRepository();
