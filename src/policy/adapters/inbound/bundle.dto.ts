/**
 * Bundle DTOs for HTTP communication
 */

// Request DTOs
export class BundlePostRequestDto {
  name: string;
  description: string;
  basePrice: number;
  discountRate: number;
  items?: Array<{ itemId: string; quantity: number }>;
}

export class BundlePutRequestDto {
  name?: string;
  description?: string;
  basePrice?: number;
  discountRate?: number;
  isActive?: boolean;
}

export class BundleItemPostRequestDto {
  itemId: string;
  quantity: number;
}

export class BundleItemPutRequestDto {
  quantity: number;
}

// Response DTOs
export class BundleGetResponseDto {
  bundleId: string;
  name: string;
  description: string;
  basePrice: number;
  discountRate: number;
  discountedPrice: number;
  isActive: boolean;
  contents: Array<{
    itemId: string;
    quantity: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export class BundleGetQueryResponseDto {
  bundles: BundleGetResponseDto[];
}

export class BundleSuccessResponseDto {
  success: boolean;
}
