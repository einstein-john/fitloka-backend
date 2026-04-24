import type { PaymentInstance } from "../../database/models/Payment";
import type { PaymentStatus } from "../../types/catalog.types";
import type { Transaction } from "sequelize";

export interface CreatePaymentInput {
  orderId: number;
  provider: string;
  amount: number;
  status: PaymentStatus;
  transactionReference?: string | null;
}

export interface IPaymentRepository {
  create(data: CreatePaymentInput, transaction?: Transaction): Promise<PaymentInstance>;
  findByOrderId(orderId: number): Promise<PaymentInstance[]>;
  updateStatus(
    paymentId: number,
    status: PaymentStatus,
    transactionReference?: string | null,
    transaction?: Transaction
  ): Promise<[number]>;
}
