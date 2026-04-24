import type { CategoryInstance } from "../../database/models/Category";

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string | null;
}

export interface ICategoryRepository {
  create(data: CreateCategoryInput): Promise<CategoryInstance>;
  findById(id: number): Promise<CategoryInstance | null>;
  findBySlug(slug: string): Promise<CategoryInstance | null>;
  findAll(search?: string): Promise<CategoryInstance[]>;
  update(id: number, data: Partial<CreateCategoryInput>): Promise<[number]>;
  delete(id: number): Promise<number>;
}
