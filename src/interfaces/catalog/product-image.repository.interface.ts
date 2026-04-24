import type { ImageInstance } from "../../database/models/Image";
import type { ProductImageInstance } from "../../database/models/ProductImage";

export interface IProductImageRepository {
  findImageByUrl(url: string): Promise<ImageInstance | null>;
  createImage(url: string, altText: string | null): Promise<ImageInstance>;
  findOrCreateImage(url: string, altText: string | null): Promise<ImageInstance>;
  findExistingLink(productId: number, imageId: number): Promise<ProductImageInstance | null>;
  clearPrimaryForProduct(productId: number): Promise<[number]>;
  attach(
    productId: number,
    imageId: number,
    sortOrder: number,
    isPrimary: boolean
  ): Promise<ProductImageInstance>;
  findByIdAndProduct(
    productImageId: number,
    productId: number
  ): Promise<ProductImageInstance | null>;
  remove(productImageId: number, productId: number): Promise<number>;
}
