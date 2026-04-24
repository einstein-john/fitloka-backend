import type { OrderInstance } from "../../database/models/Order";
import type { OrderStatus } from "../../types/catalog.types";
import type { Sequelize, Transaction } from "sequelize";

export interface OrderLineInput {
  productId: number;
  quantity: number;
  unitPrice: number;
  productName: string;
}

export interface CreateOrderInput {
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  lines: OrderLineInput[];
}

export interface IOrderRepository {
  createWithItems(input: CreateOrderInput, sequelize: Sequelize): Promise<OrderInstance>;
  findByIdForUser(orderId: number, userId: number): Promise<OrderInstance | null>;
  findAllForUser(
    userId: number,
    limit: number,
    offset: number
  ): Promise<{ rows: OrderInstance[]; count: number }>;
  updateStatus(orderId: number, status: OrderStatus, transaction?: Transaction): Promise<[number]>;
}
