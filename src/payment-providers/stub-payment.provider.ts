import { randomUUID } from "crypto";
import type { IPaymentProvider, PaymentCheckoutInput, PaymentCheckoutResult } from "../interfaces";

class StubPaymentProvider implements IPaymentProvider {
  readonly name = "stub";

  async checkout(input: PaymentCheckoutInput): Promise<PaymentCheckoutResult> {
    return {
      provider: this.name,
      status: "completed",
      transactionReference: `stub_${randomUUID()}`,
      raw: { orderId: input.orderId, amount: input.amount },
    };
  }

  async handleWebhook(payload: unknown): Promise<{ orderId: number; status: string } | null> {
    if (!payload || typeof payload !== "object") return null;
    const p = payload as Record<string, unknown>;
    const orderId = typeof p.orderId === "number" ? p.orderId : Number(p.orderId);
    if (!Number.isFinite(orderId)) return null;
    return { orderId, status: "completed" };
  }
}

export default new StubPaymentProvider();
