import Image from "../database/models/Image";
import ProductImage from "../database/models/ProductImage";
import type { ImageInstance } from "../database/models/Image";
import type { ProductImageInstance } from "../database/models/ProductImage";
import type { IProductImageRepository } from "../interfaces/catalog/product-image.repository.interface";

class ProductImageRepository implements IProductImageRepository {
  async findImageByUrl(url: string): Promise<ImageInstance | null> {
    return Image.findOne({ where: { url } });
  }

  async createImage(url: string, altText: string | null): Promise<ImageInstance> {
    return Image.create({ url, altText });
  }

  async findOrCreateImage(url: string, altText: string | null): Promise<ImageInstance> {
    const existing = await this.findImageByUrl(url);
    if (existing) {
      if (altText != null && altText !== "") {
        await existing.update({ altText });
      }
      return existing.reload();
    }
    return this.createImage(url, altText);
  }

  async findExistingLink(productId: number, imageId: number): Promise<ProductImageInstance | null> {
    return ProductImage.findOne({ where: { productId, imageId } });
  }

  async clearPrimaryForProduct(productId: number): Promise<[number]> {
    return ProductImage.update({ isPrimary: false }, { where: { productId, isPrimary: true } });
  }

  async attach(
    productId: number,
    imageId: number,
    sortOrder: number,
    isPrimary: boolean
  ): Promise<ProductImageInstance> {
    return ProductImage.create({ productId, imageId, sortOrder, isPrimary });
  }

  async findByIdAndProduct(
    productImageId: number,
    productId: number
  ): Promise<ProductImageInstance | null> {
    return ProductImage.findOne({ where: { id: productImageId, productId } });
  }

  async remove(productImageId: number, productId: number): Promise<number> {
    return ProductImage.destroy({ where: { id: productImageId, productId } });
  }
}

export default new ProductImageRepository();
