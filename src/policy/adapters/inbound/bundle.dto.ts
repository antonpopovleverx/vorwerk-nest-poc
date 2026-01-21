/**
 * Bundle DTOs for HTTP communication
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Request DTOs
export class BundlePostRequestDto {
  @ApiProperty({
    description: 'The name of the bundle',
    example: 'Premium Electronics Bundle',
    type: 'string',
  })
  name: string;

  @ApiProperty({
    description: 'The description of the bundle',
    example: 'Complete electronics package with discount',
    type: 'string',
  })
  description: string;

  @ApiProperty({
    description: 'The base price of the bundle before discount',
    example: 199.99,
    type: 'number',
    minimum: 0,
  })
  basePrice: number;

  @ApiProperty({
    description: 'The discount rate as a percentage (0-100)',
    example: 15,
    type: 'number',
    minimum: 0,
    maximum: 100,
  })
  discountRate: number;

  @ApiPropertyOptional({
    description: 'Array of items included in the bundle',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        itemId: { type: 'string', example: 'item-123' },
        quantity: { type: 'number', example: 1 },
      },
    },
  })
  items?: Array<{ itemId: string; quantity: number }>;
}

export class BundlePutRequestDto {
  @ApiPropertyOptional({
    description: 'The updated name of the bundle',
    example: 'Updated Electronics Bundle',
    type: 'string',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'The updated description of the bundle',
    example: 'Updated bundle description',
    type: 'string',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'The updated base price of the bundle',
    example: 249.99,
    type: 'number',
    minimum: 0,
  })
  basePrice?: number;

  @ApiPropertyOptional({
    description: 'The updated discount rate as a percentage (0-100)',
    example: 20,
    type: 'number',
    minimum: 0,
    maximum: 100,
  })
  discountRate?: number;

  @ApiPropertyOptional({
    description: 'Whether the bundle is active',
    example: true,
    type: 'boolean',
  })
  isActive?: boolean;
}

export class BundleItemPostRequestDto {
  @ApiProperty({
    description: 'The unique identifier of the item to add',
    example: 'item-456',
    type: 'string',
  })
  itemId: string;

  @ApiProperty({
    description: 'The quantity of the item in the bundle',
    example: 2,
    type: 'number',
    minimum: 1,
  })
  quantity: number;
}

export class BundleItemPutRequestDto {
  @ApiProperty({
    description: 'The updated quantity of the item in the bundle',
    example: 3,
    type: 'number',
    minimum: 1,
  })
  quantity: number;
}

// Response DTOs
export class BundleGetResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the bundle',
    example: 'bundle-123',
    type: 'string',
  })
  bundleId: string;

  @ApiProperty({
    description: 'The name of the bundle',
    example: 'Premium Electronics Bundle',
    type: 'string',
  })
  name: string;

  @ApiProperty({
    description: 'The description of the bundle',
    example: 'Complete electronics package with discount',
    type: 'string',
  })
  description: string;

  @ApiProperty({
    description: 'The base price before discount',
    example: 199.99,
    type: 'number',
  })
  basePrice: number;

  @ApiProperty({
    description: 'The discount rate as a percentage',
    example: 15,
    type: 'number',
  })
  discountRate: number;

  @ApiProperty({
    description: 'The final price after discount',
    example: 169.99,
    type: 'number',
  })
  discountedPrice: number;

  @ApiProperty({
    description: 'Whether the bundle is currently active',
    example: true,
    type: 'boolean',
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Array of items included in the bundle',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        itemId: { type: 'string', example: 'item-456' },
        quantity: { type: 'number', example: 2 },
      },
    },
  })
  contents: Array<{
    itemId: string;
    quantity: number;
  }>;

  @ApiProperty({
    description: 'Timestamp when the bundle was created',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the bundle was last updated',
    example: '2024-01-15T10:35:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}

export class BundleGetQueryResponseDto {
  @ApiProperty({
    description: 'Array of bundles',
    type: 'array',
    items: {
      $ref: '#/components/schemas/BundleGetResponseDto',
    },
  })
  bundles: BundleGetResponseDto[];
}

export class BundleSuccessResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true,
    type: 'boolean',
  })
  success: boolean;
}
