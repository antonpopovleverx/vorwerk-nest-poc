
import { SupportedCurrency } from 'src/_common/domain/enums/currency.enum';
import { BasketSnapshot } from 'src/basket/domain/basket/basket.entity';

export class PolicyCheckResult {
  checkName!: BasketPolicyCheckName;
  passed!: boolean;
  message?: string;
}

export enum BasketPolicyCheckName {
  MAX_ITEMS_PER_BASKET = 'MAX_ITEMS_PER_BASKET',
  MAX_BUNDLES_PER_BASKET = 'MAX_BUNDLES_PER_BASKET',
  MIN_ORDER_VALUE = 'MIN_ORDER_VALUE',
  ITEM_AVAILABILITY = 'ITEM_AVAILABILITY',
  BUNDLE_AVAILABILITY = 'BUNDLE_AVAILABILITY',
}

export class BasketPricingResult {
  items!: Array<{
    itemId: string;
    amount: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
  }>;
  bundles!: Array<{
    bundleId: string;
    amount: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
  }>;
  subtotal!: number;
  totalDiscount!: number;
  total!: number;
  SupportedCurrency!: SupportedCurrency;
}

export class PolicySnapshot {
  pricing!: BasketPricingResult;
  checksPerformed!: BasketPolicyCheckName[];
  pricedAt!: Date;
}

export abstract class PolicyServicePort {
  abstract getBasketPolicyChecks(
    basketSnapshot: BasketSnapshot,
  ): Promise<BasketPolicyCheckName[]>;

  abstract calculateBasketPricing(
    basketSnapshot: BasketSnapshot,
  ): Promise<BasketPricingResult>;

  abstract createPolicySnapshot(
    basketSnapshot: BasketSnapshot,
  ): Promise<PolicySnapshot>;
}
