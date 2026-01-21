import { Currency } from 'src/_common/domain/enums/currency.enum';
import { BasketSnapshot } from 'src/basket/domain/basket/basket.entity';

/**
 * Policy check result
 */
export interface PolicyCheckResult {
  checkName: BasketPolicyCheckName;
  passed: boolean;
  message?: string;
}

/**
 * Enum of basket policy check names
 */
export enum BasketPolicyCheckName {
  MAX_ITEMS_PER_BASKET = 'MAX_ITEMS_PER_BASKET',
  MAX_BUNDLES_PER_BASKET = 'MAX_BUNDLES_PER_BASKET',
  MIN_ORDER_VALUE = 'MIN_ORDER_VALUE',
  ITEM_AVAILABILITY = 'ITEM_AVAILABILITY',
  BUNDLE_AVAILABILITY = 'BUNDLE_AVAILABILITY',
}

/**
 * Pricing result for basket
 */
export interface BasketPricingResult {
  items: Array<{
    itemId: string;
    amount: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
  }>;
  bundles: Array<{
    bundleId: string;
    amount: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
  }>;
  subtotal: number;
  totalDiscount: number;
  total: number;
  currency: Currency;
}

/**
 * Policy snapshot for quotes
 */
export interface PolicySnapshot {
  pricing: BasketPricingResult;
  checksPerformed: BasketPolicyCheckName[];
  pricedAt: Date;
}

/**
 * Port for policy service (basket subdomain -> policy subdomain)
 */
export abstract class IPolicyServicePort {
  /**
   * Get basket policy checks to perform
   */
  abstract getBasketPolicyChecks(
    basketSnapshot: BasketSnapshot,
  ): Promise<BasketPolicyCheckName[]>;

  /**
   * Calculate pricing for basket
   */
  abstract calculateBasketPricing(
    basketSnapshot: BasketSnapshot,
  ): Promise<BasketPricingResult>;

  /**
   * Create a policy snapshot for quote
   */
  abstract createPolicySnapshot(
    basketSnapshot: BasketSnapshot,
  ): Promise<PolicySnapshot>;
}
