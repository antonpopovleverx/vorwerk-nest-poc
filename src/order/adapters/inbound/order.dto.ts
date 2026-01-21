/**
 * Order DTOs for HTTP communication
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Response DTOs
export class OrderGetResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the order',
    example: 'order-123',
    type: 'string',
  })
  orderId: string;

  @ApiProperty({
    description: 'The unique identifier of the user who placed the order',
    example: 'user-456',
    type: 'string',
  })
  userId: string;

  @ApiProperty({
    description: 'The unique identifier of the quote this order was created from',
    example: 'quote-789',
    type: 'string',
  })
  quoteId: string;

  @ApiPropertyOptional({
    description: 'The business partner identifier',
    example: 'partner-101',
    type: 'string',
  })
  businessPartnerId?: string;

  @ApiProperty({
    description: 'The current status of the order',
    example: 'pending_payment',
    type: 'string',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Reference to the payment transaction',
    example: 'pay-2024-001',
    type: 'string',
  })
  paymentReference?: string;

  @ApiPropertyOptional({
    description: 'Reference to the delivery tracking',
    example: 'del-2024-001',
    type: 'string',
  })
  deliveryReference?: string;

  @ApiPropertyOptional({
    description: 'Reason for failure if the order failed',
    example: 'Payment declined by bank',
    type: 'string',
  })
  failureReason?: string;

  @ApiProperty({
    description: 'Timestamp when the order was created',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the order was last updated',
    example: '2024-01-15T10:35:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}

export class OrderGetQueryResponseDto {
  @ApiProperty({
    description: 'Array of orders',
    type: 'array',
    items: {
      $ref: '#/components/schemas/OrderGetResponseDto',
    },
  })
  orders: OrderGetResponseDto[];
}

export class QuoteGetResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the quote',
    example: 'quote-789',
    type: 'string',
  })
  quoteId: string;

  @ApiProperty({
    description: 'The unique identifier of the user who requested the quote',
    example: 'user-456',
    type: 'string',
  })
  userId: string;

  @ApiPropertyOptional({
    description: 'The business partner identifier',
    example: 'partner-101',
    type: 'string',
  })
  businessPartnerId?: string;

  @ApiProperty({
    description: 'The total price of the quote',
    example: 135.00,
    type: 'number',
  })
  price: number;

  @ApiProperty({
    description: 'The currency code for the price',
    example: 'EUR',
    type: 'string',
  })
  currency: string;

  @ApiProperty({
    description: 'Snapshot of the basket at the time of quote creation',
    example: { items: [{ itemId: 'item-123', amount: 2 }] },
  })
  basketSnapshot: any; // TODO: Define proper basket snapshot type

  @ApiProperty({
    description: 'Snapshot of the policies applied at the time of quote creation',
    example: { discounts: [{ type: 'percentage', value: 10 }] },
  })
  policySnapshot: any; // TODO: Define proper policy snapshot type

  @ApiProperty({
    description: 'Timestamp when the quote was created',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
}

// Saga execution response
export class OrderSagaExecutionResponseDto {
  @ApiProperty({
    description: 'Whether the saga execution was successful',
    example: true,
    type: 'boolean',
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'The resulting order if execution was successful',
    type: 'object',
    $ref: '#/components/schemas/OrderGetResponseDto',
  })
  order?: OrderGetResponseDto;

  @ApiPropertyOptional({
    description: 'Error message if saga execution failed',
    example: 'Payment processing failed',
    type: 'string',
  })
  error?: string;
}

// Payment step response
export class OrderPaymentResponseDto {
  @ApiProperty({
    description: 'Whether the payment step was successful',
    example: true,
    type: 'boolean',
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'The updated order after payment processing',
    type: 'object',
    $ref: '#/components/schemas/OrderGetResponseDto',
  })
  order?: OrderGetResponseDto;

  @ApiPropertyOptional({
    description: 'Error message if payment failed',
    example: 'Card declined',
    type: 'string',
  })
  error?: string;
}

// Delivery step response
export class OrderDeliveryResponseDto {
  @ApiProperty({
    description: 'Whether the delivery step was successful',
    example: true,
    type: 'boolean',
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'The updated order after delivery processing',
    type: 'object',
    $ref: '#/components/schemas/OrderGetResponseDto',
  })
  order?: OrderGetResponseDto;

  @ApiPropertyOptional({
    description: 'Error message if delivery failed',
    example: 'Address validation failed',
    type: 'string',
  })
  error?: string;
}
