import { Op } from "sequelize";
import Inventory from "../database/models/Inventory";
import type { InventoryInstance } from "../database/models/Inventory";
import type { IInventoryRepository } from "../interfaces/catalog/inventory.repository.interface";

class InventoryRepository implements IInventoryRepository {
  async createForProduct(productId: number, stock: number): Promise<InventoryInstance> {
    return Inventory.create({ productId, stock, reservedStock: 0 });
  }

  async findByProductId(productId: number): Promise<InventoryInstance | null> {
    return Inventory.findOne({ where: { productId } });
  }

  async updateStock(productId: number, stock: number): Promise<[number]> {
    return Inventory.update({ stock }, { where: { productId } });
  }

  async adjustStock(productId: number, delta: number): Promise<InventoryInstance | null> {
    const row = await Inventory.findOne({ where: { productId } });
    if (!row) return null;
    const next = row.stock + delta;
    await row.update({ stock: Math.max(0, next) });
    return row.reload();
  }

  async decrementStock(productId: number, quantity: number): Promise<void> {
    const row = await Inventory.findOne({ where: { productId } });
    if (!row) {
      throw new Error("Inventory not found for product");
    }
    if (row.stock < quantity) {
      throw new Error("Insufficient stock");
    }
    await Inventory.update(
      { stock: row.stock - quantity },
      { where: { productId, stock: { [Op.gte]: quantity } } }
    );
  }
}

export default new InventoryRepository();
