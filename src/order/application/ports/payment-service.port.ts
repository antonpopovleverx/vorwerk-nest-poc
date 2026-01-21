/**
 * Payment request
 */
export class PaymentRequest {
  orderId!: string;
  userId!: string;
  amount!: number;
  currency!: string;
}

/**
 * Payment result
 */
export class PaymentResult {
  success!: boolean;
  paymentReference?: string;
  error?: string;
}

/**
 * Refund request
 */
export class RefundRequest {
  paymentReference!: string;
  amount!: number;
  reason!: string;
}

/**
 * Port for payment service (external microservice mock)
 */
export abstract class IPaymentServicePort {
  /**
   * Process payment
   */
  abstract processPayment(request: PaymentRequest): Promise<PaymentResult>;

  /**
   * Refund payment (compensatory action)
   */
  abstract refundPayment(request: RefundRequest): Promise<{ success: boolean }>;
}
