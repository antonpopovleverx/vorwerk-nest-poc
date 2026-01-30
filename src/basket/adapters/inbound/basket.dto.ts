import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BasketPostRequestDto {
  @ApiProperty({
    description: 'The unique identifier of the item to add to the basket',
    example: 'item-123',
    type: 'string',
  })
  itemId: string;

  @ApiPropertyOptional({
    description: 'The quantity of the item to add',
    example: 2,
    type: 'number',
    minimum: 1,
  })
  amount?: number;
}

export class BasketPutRequestDto {
  @ApiProperty({
    description: 'The new quantity for the item',
    example: 3,
    type: 'number',
    minimum: 1,
  })
  amount: number;
}

export class BasketBundlePostRequestDto {
  @ApiProperty({
    description: 'The unique identifier of the bundle to add to the basket',
    example: 'bundle-456',
    type: 'string',
  })
  bundleId: string;

  @ApiPropertyOptional({
    description: 'The quantity of the bundle to add',
    example: 1,
    type: 'number',
    minimum: 1,
  })
  amount?: number;
}

export class BasketBundlePutRequestDto {
  @ApiProperty({
    description: 'The new quantity for the bundle',
    example: 2,
    type: 'number',
    minimum: 1,
  })
  amount: number;
}

export class BasketCheckoutPostRequestDto {
  @ApiPropertyOptional({
    description: 'The business partner identifier for checkout',
    example: 'partner-789',
    type: 'string',
  })
  businessPartnerId?: string;
}

export class BasketGetResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the basket',
    example: 'basket-123',
    type: 'string',
  })
  basketId: string;

  @ApiProperty({
    description: 'The unique identifier of the user who owns the basket',
    example: 'user-456',
    type: 'string',
  })
  userId: string;

  @ApiProperty({
    description: 'Array of items in the basket',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        itemId: { type: 'string', example: 'item-789' },
        amount: { type: 'number', example: 2 },
      },
    },
  })
  items: Array<{
    itemId: string;
    amount: number;
  }>;

  @ApiProperty({
    description: 'Array of bundles in the basket',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        bundleId: { type: 'string', example: 'bundle-101' },
        amount: { type: 'number', example: 1 },
      },
    },
  })
  bundles: Array<{
    bundleId: string;
    amount: number;
  }>;
}

export class BasketPricingGetResponseDto {
  @ApiProperty({
    description: 'The subtotal before discounts',
    example: 150.0,
    type: 'number',
  })
  subtotal: number;

  @ApiProperty({
    description: 'The total discount applied',
    example: 15.0,
    type: 'number',
  })
  totalDiscount: number;

  @ApiProperty({
    description: 'The final total after discounts',
    example: 135.0,
    type: 'number',
  })
  total: number;

  @ApiProperty({
    description: 'The SupportedCurrency code',
    example: 'EUR',
    type: 'string',
  })
  SupportedCurrency: string;
}

export class BasketValidationGetResponseDto {
  @ApiProperty({
    description: 'Whether the basket is valid',
    example: true,
    type: 'boolean',
  })
  valid: boolean;

  @ApiProperty({
    description: 'Array of failed validation checks',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        checkName: { type: 'string', example: 'minimum_order_value' },
        message: { type: 'string', example: 'Order must be at least €10.00' },
      },
    },
  })
  failedChecks: Array<{
    checkName: string;
    message: string;
  }>;
}

export class BasketCheckoutPreviewGetResponseDto {
  @ApiProperty({
    description: 'Whether the checkout is valid',
    example: true,
    type: 'boolean',
  })
  valid: boolean;

  @ApiPropertyOptional({
    description: 'Pricing information for the checkout',
    type: 'object',
    properties: {
      subtotal: { type: 'number', example: 150.0 },
      totalDiscount: { type: 'number', example: 15.0 },
      total: { type: 'number', example: 135.0 },
      SupportedCurrency: { type: 'string', example: 'EUR' },
    },
  })
  pricing?: {
    subtotal: number;
    totalDiscount: number;
    total: number;
    SupportedCurrency: string;
  };

  @ApiPropertyOptional({
    description: 'Array of validation errors preventing checkout',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        checkName: { type: 'string', example: 'payment_method' },
        message: { type: 'string', example: 'Payment method is required' },
      },
    },
  })
  validationErrors?: Array<{ checkName: string; message: string }>;
}

export class BasketCheckoutPostResponseDto {
  @ApiProperty({
    description: 'Whether the checkout was successful',
    example: true,
    type: 'boolean',
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'The generated quote information',
    example: { quoteId: 'quote-123', price: 135.0 },
  })
  quote?: any;

  @ApiPropertyOptional({
    description: 'Error message if checkout failed',
    example: 'Insufficient inventory for item-789',
    type: 'string',
  })
  error?: string;

  @ApiPropertyOptional({
    description: 'Array of validation errors',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        checkName: { type: 'string', example: 'inventory_check' },
        message: { type: 'string', example: 'Item out of stock' },
      },
    },
  })
  validationErrors?: Array<{ checkName: string; message: string }>;
}

export class BasketSuccessResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true,
    type: 'boolean',
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'The basket ID if applicable',
    example: 'basket-123',
    type: 'string',
  })
  basketId?: string;
}
