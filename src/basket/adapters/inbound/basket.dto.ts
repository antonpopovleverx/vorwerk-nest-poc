/**
 * Basket DTOs for HTTP communication
 */

// Request DTOs
export class BasketPostRequestDto {
  itemId: string;
  amount?: number;
}

export class BasketPutRequestDto {
  amount: number;
}

export class BasketBundlePostRequestDto {
  bundleId: string;
  amount?: number;
}

export class BasketBundlePutRequestDto {
  amount: number;
}

export class BasketCheckoutPostRequestDto {
  businessPartnerId?: string;
}

// Response DTOs
export class BasketGetResponseDto {
  basketId: string;
  userId: string;
  items: Array<{
    itemId: string;
    amount: number;
  }>;
  bundles: Array<{
    bundleId: string;
    amount: number;
  }>;
}

export class BasketPricingGetResponseDto {
  subtotal: number;
  totalDiscount: number;
  total: number;
  currency: string;
}

export class BasketValidationGetResponseDto {
  valid: boolean;
  failedChecks: Array<{
    checkName: string;
    message: string;
  }>;
}

export class BasketCheckoutPreviewGetResponseDto {
  valid: boolean;
  pricing?: {
    subtotal: number;
    totalDiscount: number;
    total: number;
    currency: string;
  };
  validationErrors?: Array<{ checkName: string; message: string }>;
}

export class BasketCheckoutPostResponseDto {
  success: boolean;
  quote?: any; // TODO: Define proper quote response type
  error?: string;
  validationErrors?: Array<{ checkName: string; message: string }>;
}

// Generic success response
export class BasketSuccessResponseDto {
  success: boolean;
  basketId?: string;
}
