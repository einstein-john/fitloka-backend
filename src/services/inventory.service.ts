import { NotFoundError } from "../errors";
import { inventoryRepository, productRepository } from "../repositories";

class InventoryService {
  public async getByProductId(productId: number) {
    const product = await productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");
    const inv = await inventoryRepository.findByProductId(productId);
    if (!inv) throw new NotFoundError("Inventory not found");
    return inv;
  }

  public async setStock(productId: number, stock: number) {
    await this.getByProductId(productId);
    await inventoryRepository.updateStock(productId, stock);
    return inventoryRepository.findByProductId(productId);
  }
}

export default new InventoryService();
