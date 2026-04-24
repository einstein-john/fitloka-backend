import type { InventoryInstance } from "../../database/models/Inventory";

export interface IInventoryRepository {
  createForProduct(productId: number, stock: number): Promise<InventoryInstance>;
  findByProductId(productId: number): Promise<InventoryInstance | null>;
  updateStock(productId: number, stock: number): Promise<[number]>;
  adjustStock(productId: number, delta: number): Promise<InventoryInstance | null>;
  decrementStock(productId: number, quantity: number): Promise<void>;
}
