import { BadRequestError, NotFoundError } from "../errors";
import database from "../database";
import stubPaymentProvider from "../payment-providers/stub-payment.provider";
import { inventoryRepository, orderRepository, paymentRepository } from "../repositories";
import Order from "../database/models/Order";
import OrderItem from "../database/models/OrderItem";

class PaymentService {
  public async checkout(userId: number, orderId: number) {
    const order = await orderRepository.findByIdForUser(orderId, userId);
    if (!order) throw new NotFoundError("Order not found");
    if (order.status !== "PENDING") {
      throw new BadRequestError("Order is not payable in its current state");
    }

    const amount = Number(order.totalAmount);
    const sequelize = database.getSequelize();

    const payment = await paymentRepository.create({
      orderId: order.id,
      provider: stubPaymentProvider.name,
      amount,
      status: "PENDING",
    });

    const result = await stubPaymentProvider.checkout({
      orderId: order.id,
      amount,
    });

    if (result.status === "completed") {
      await sequelize.transaction(async (t) => {
        await paymentRepository.updateStatus(
          payment.id,
          "COMPLETED",
          result.transactionReference,
          t
        );
        await orderRepository.updateStatus(order.id, "PAID", t);
        const items = await OrderItem.findAll({ where: { orderId: order.id }, transaction: t });
        for (const line of items) {
          await inventoryRepository.decrementStock(line.productId, line.quantity);
        }
      });
    } else if (result.status === "failed") {
      await paymentRepository.updateStatus(payment.id, "FAILED", result.transactionReference);
    }

    return paymentRepository.findByOrderId(order.id);
  }

  public async webhook(payload: unknown) {
    const parsed = await stubPaymentProvider.handleWebhook?.(payload);
    if (!parsed) {
      return { processed: false as const };
    }

    const orderRow = await Order.findByPk(parsed.orderId, {
      include: [{ model: OrderItem, as: "items" }],
    });
    if (!orderRow) return { processed: false as const };

    if (parsed.status === "completed" && orderRow.status === "PENDING") {
      const sequelize = database.getSequelize();
      await sequelize.transaction(async (t) => {
        await orderRepository.updateStatus(orderRow.id, "PAID", t);
        const items = orderRow.items ?? [];
        for (const line of items) {
          await inventoryRepository.decrementStock(line.productId, line.quantity);
        }
      });
    }

    return { processed: true as const, orderId: parsed.orderId };
  }
}

export default new PaymentService();
