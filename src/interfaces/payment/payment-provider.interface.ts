/**
 * Pluggable payment provider (Stripe, PayPal, etc.).
 * Stub implementation completes payments immediately for development.
 */
export interface PaymentCheckoutInput {
  orderId: number;
  amount: number;
  currency?: string;
}

export interface PaymentCheckoutResult {
  provider: string;
  status: "completed" | "pending" | "failed";
  transactionReference: string;
  raw?: Record<string, unknown>;
}

export interface IPaymentProvider {
  readonly name: string;
  checkout(input: PaymentCheckoutInput): Promise<PaymentCheckoutResult>;
  /** Optional webhook verification / processing */
  handleWebhook?(payload: unknown): Promise<{ orderId: number; status: string } | null>;
}
