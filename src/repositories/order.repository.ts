import type { Sequelize, Transaction } from "sequelize";
import Order from "../database/models/Order";
import OrderItem from "../database/models/OrderItem";
import type { OrderInstance } from "../database/models/Order";
import type { OrderStatus } from "../types/catalog.types";
import type {
  CreateOrderInput,
  IOrderRepository,
} from "../interfaces/order/order.repository.interface";

class OrderRepository implements IOrderRepository {
  async createWithItems(input: CreateOrderInput, sequelize: Sequelize): Promise<OrderInstance> {
    return sequelize.transaction(async (t: Transaction) => {
      const order = await Order.create(
        {
          userId: input.userId,
          status: input.status,
          totalAmount: String(input.totalAmount),
        },
        { transaction: t }
      );
      for (const line of input.lines) {
        await OrderItem.create(
          {
            orderId: order.id,
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: String(line.unitPrice),
            productName: line.productName,
          },
          { transaction: t }
        );
      }
      const full = await Order.findByPk(order.id, {
        include: [{ model: OrderItem, as: "items" }],
        transaction: t,
      });
      return full as OrderInstance;
    });
  }

  async findByIdForUser(orderId: number, userId: number): Promise<OrderInstance | null> {
    return Order.findOne({
      where: { id: orderId, userId },
      include: [{ model: OrderItem, as: "items" }],
    });
  }

  async findAllForUser(
    userId: number,
    limit: number,
    offset: number
  ): Promise<{ rows: OrderInstance[]; count: number }> {
    return Order.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [{ model: OrderItem, as: "items" }],
    });
  }

  async updateStatus(
    orderId: number,
    status: OrderStatus,
    transaction?: Transaction
  ): Promise<[number]> {
    return Order.update({ status }, { where: { id: orderId }, transaction });
  }
}

export default new OrderRepository();
