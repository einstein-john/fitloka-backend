import type { ProductInstance } from "../../database/models/Product";
import type { ProductStatus } from "../../types/catalog.types";

export interface CreateProductInput {
  categoryId: number;
  name: string;
  sku: string;
  description?: string | null;
  price: number;
  status?: ProductStatus;
}

export interface IProductRepository {
  create(data: CreateProductInput): Promise<ProductInstance>;
  findById(id: number): Promise<ProductInstance | null>;
  findBySku(sku: string): Promise<ProductInstance | null>;
  findAll(options: {
    categoryId?: number;
    search?: string;
    limit: number;
    offset: number;
  }): Promise<{ rows: ProductInstance[]; count: number }>;
  update(id: number, data: Partial<CreateProductInput>): Promise<[number]>;
  delete(id: number): Promise<number>;
}
