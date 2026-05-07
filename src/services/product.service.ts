import { UniqueConstraintError } from "sequelize";
import { ConflictError, NotFoundError } from "../errors";
import {
  categoryRepository,
  inventoryRepository,
  productImageRepository,
  productRepository,
} from "../repositories";
import cloudinaryService from "./cloudinary.service";
import type { ProductStatus } from "../types/catalog.types";
import type { ReqQueryOptions } from "../types/general.interface";

class ProductService {
  public async create(input: {
    categoryId: number;
    name: string;
    sku: string;
    description?: string | null;
    price: number;
    status?: ProductStatus;
    initialStock?: number;
  }) {
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) throw new NotFoundError("Category not found");
    const existingSku = await productRepository.findBySku(input.sku);
    if (existingSku) throw new ConflictError("SKU already exists");
    const product = await productRepository.create({
      categoryId: input.categoryId,
      name: input.name,
      sku: input.sku,
      description: input.description ?? null,
      price: input.price,
      status: input.status ?? "ACTIVE",
    });
    const stock = Math.max(0, input.initialStock ?? 0);
    await inventoryRepository.createForProduct(product.id, stock);
    return productRepository.findById(product.id);
  }

  public async getById(id: number) {
    const p = await productRepository.findById(id);
    if (!p) throw new NotFoundError("Product not found");
    return p;
  }

  public async list(opts: ReqQueryOptions & { categoryId?: number }) {
    return productRepository.findAll({
      categoryId: opts.categoryId,
      search: opts.search,
      limit: opts.limit,
      offset: opts.offset,
    });
  }

  public async update(
    id: number,
    data: Partial<{
      categoryId: number;
      name: string;
      sku: string;
      description: string | null;
      price: number;
      status: ProductStatus;
    }>
  ) {
    await this.getById(id);
    if (data.sku) {
      const existing = await productRepository.findBySku(data.sku);
      if (existing && existing.id !== id) {
        throw new ConflictError("SKU already exists");
      }
    }
    if (data.categoryId) {
      const cat = await categoryRepository.findById(data.categoryId);
      if (!cat) throw new NotFoundError("Category not found");
    }
    await productRepository.update(id, data);
    return productRepository.findById(id);
  }

  public async delete(id: number) {
    await this.getById(id);
    return productRepository.delete(id);
  }

  public async attachImage(
    productId: number,
    input: { url: string; altText?: string | null; sortOrder?: number; isPrimary?: boolean }
  ) {
    await this.getById(productId);
    const image = await productImageRepository.findOrCreateImage(input.url, input.altText ?? null);
    const duplicate = await productImageRepository.findExistingLink(productId, image.id);
    if (duplicate) {
      throw new ConflictError("This image is already linked to the product");
    }
    if (input.isPrimary) {
      await productImageRepository.clearPrimaryForProduct(productId);
    }
    try {
      await productImageRepository.attach(
        productId,
        image.id,
        input.sortOrder ?? 0,
        Boolean(input.isPrimary)
      );
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        throw new ConflictError("This image is already linked to the product");
      }
      throw err;
    }
    return productRepository.findById(productId);
  }

  public async removeImage(productId: number, productImageId: number) {
    await this.getById(productId);
    const link = await productImageRepository.findByIdAndProduct(productImageId, productId);
    if (!link) {
      throw new NotFoundError("Product image link not found");
    }
    const { imageId } = link;
    const imageRow = await productImageRepository.findImageById(imageId);
    const urlForCleanup = imageRow?.url ?? null;
    await productImageRepository.remove(productImageId, productId);
    const remaining = await productImageRepository.countLinksByImageId(imageId);
    if (remaining === 0 && urlForCleanup) {
      await productImageRepository.deleteImageRow(imageId);
      cloudinaryService.scheduleDestroyBySecureUrl(urlForCleanup);
    }
    return productRepository.findById(productId);
  }
}

export default new ProductService();
