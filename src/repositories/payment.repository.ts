import type { Transaction } from "sequelize";
import Payment from "../database/models/Payment";
import type { PaymentInstance } from "../database/models/Payment";
import type { PaymentStatus } from "../types/catalog.types";
import type {
  CreatePaymentInput,
  IPaymentRepository,
} from "../interfaces/payment/payment.repository.interface";

class PaymentRepository implements IPaymentRepository {
  async create(data: CreatePaymentInput, transaction?: Transaction): Promise<PaymentInstance> {
    return Payment.create(
      {
        orderId: data.orderId,
        provider: data.provider,
        amount: String(data.amount),
        status: data.status,
        transactionReference: data.transactionReference ?? null,
      },
      { transaction }
    );
  }

  async findByOrderId(orderId: number): Promise<PaymentInstance[]> {
    return Payment.findAll({ where: { orderId } });
  }

  async updateStatus(
    paymentId: number,
    status: PaymentStatus,
    transactionReference?: string | null,
    transaction?: Transaction
  ): Promise<[number]> {
    const patch: Record<string, unknown> = { status };
    if (transactionReference !== undefined) {
      patch.transactionReference = transactionReference;
    }
    return Payment.update(patch, { where: { id: paymentId }, transaction });
  }
}

export default new PaymentRepository();
