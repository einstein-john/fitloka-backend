import { BadRequestError, NotFoundError } from "../errors";
import database from "../database";
import {
  cartRepository,
  inventoryRepository,
  orderRepository,
  productRepository,
} from "../repositories";

class OrderService {
  public async createFromCart(userId: number) {
    const cart = await cartRepository.getOrCreateActiveCart(userId);
    const full = await cartRepository.findCartWithItems(cart.id, userId);
    const items = full?.items ?? [];
    if (!items.length) {
      throw new BadRequestError("Cart is empty");
    }

    let total = 0;
    const lines: { productId: number; quantity: number; unitPrice: number; productName: string }[] =
      [];

    for (const item of items) {
      const product = item.product ?? (await productRepository.findById(item.productId));
      if (!product) throw new NotFoundError(`Product ${item.productId} not found`);
      if (product.status !== "ACTIVE") {
        throw new BadRequestError(`Product ${product.name} is not available`);
      }
      const inv = await inventoryRepository.findByProductId(product.id);
      const stock = inv?.stock ?? 0;
      if (stock < item.quantity) {
        throw new BadRequestError(`Insufficient stock for ${product.name}`);
      }
      const unitPrice = Number(product.price);
      total += unitPrice * item.quantity;
      lines.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        productName: product.name,
      });
    }

    const sequelize = database.getSequelize();
    const order = await orderRepository.createWithItems(
      {
        userId,
        totalAmount: total,
        status: "PENDING",
        lines,
      },
      sequelize
    );

    await cart.update({ status: "CONVERTED" });
    await cartRepository.clearCart(cart.id);

    return order;
  }

  public async getById(orderId: number, userId: number) {
    const order = await orderRepository.findByIdForUser(orderId, userId);
    if (!order) throw new NotFoundError("Order not found");
    return order;
  }

  public async list(userId: number, limit: number, offset: number) {
    return orderRepository.findAllForUser(userId, limit, offset);
  }
}

export default new OrderService();
