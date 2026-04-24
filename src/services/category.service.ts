import { ConflictError, NotFoundError } from "../errors";
import { categoryRepository } from "../repositories";
import { slugify } from "../utils/slug.util";

class CategoryService {
  public async create(data: { name: string; description?: string | null; slug?: string }) {
    const baseSlug = data.slug?.trim() || slugify(data.name);
    let slug = baseSlug;
    let suffix = 1;
    while (await categoryRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }
    return categoryRepository.create({
      name: data.name,
      slug,
      description: data.description ?? null,
    });
  }

  public async list(search?: string) {
    return categoryRepository.findAll(search);
  }

  public async getById(id: number) {
    const row = await categoryRepository.findById(id);
    if (!row) throw new NotFoundError("Category not found");
    return row;
  }

  public async update(
    id: number,
    data: { name?: string; description?: string | null; slug?: string }
  ) {
    await this.getById(id);
    if (data.slug) {
      const existing = await categoryRepository.findBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new ConflictError("Slug already in use");
      }
    }
    await categoryRepository.update(id, {
      ...data,
      slug: data.slug ?? undefined,
    });
    return categoryRepository.findById(id);
  }

  public async delete(id: number) {
    await this.getById(id);
    return categoryRepository.delete(id);
  }
}

export default new CategoryService();
