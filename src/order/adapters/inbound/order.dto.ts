/**
 * Order DTOs for HTTP communication
 */

// Response DTOs
export class OrderGetResponseDto {
  orderId: string;
  userId: string;
  quoteId: string;
  businessPartnerId?: string;
  status: string;
  paymentReference?: string;
  deliveryReference?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderGetQueryResponseDto {
  orders: OrderGetResponseDto[];
}

export class QuoteGetResponseDto {
  quoteId: string;
  userId: string;
  businessPartnerId?: string;
  price: number;
  currency: string;
  basketSnapshot: any; // TODO: Define proper basket snapshot type
  policySnapshot: any; // TODO: Define proper policy snapshot type
  createdAt: Date;
}

// Saga execution response
export class OrderSagaExecutionResponseDto {
  success: boolean;
  order?: OrderGetResponseDto;
  error?: string;
}

// Payment step response
export class OrderPaymentResponseDto {
  success: boolean;
  order?: OrderGetResponseDto;
  error?: string;
}

// Delivery step response
export class OrderDeliveryResponseDto {
  success: boolean;
  order?: OrderGetResponseDto;
  error?: string;
}
