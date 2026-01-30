export class PaymentRequest {
  orderId!: string;
  userId!: string;
  amount!: number;
  SupportedCurrency!: string;
}

export class PaymentResult {
  success!: boolean;
  paymentReference?: string;
  error?: string;
}

export class RefundRequest {
  paymentReference!: string;
  amount!: number;
  reason!: string;
}

export abstract class PaymentServicePort {
  abstract processPayment(request: PaymentRequest): Promise<PaymentResult>;

  abstract refundPayment(request: RefundRequest): Promise<{ success: boolean }>;
}
