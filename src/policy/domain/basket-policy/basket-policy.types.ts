/**
 * Basket policy check names - defines which checks should be performed
 */
export enum BasketPolicyCheckName {
  MAX_ITEMS_PER_BASKET = 'MAX_ITEMS_PER_BASKET',
  MAX_BUNDLES_PER_BASKET = 'MAX_BUNDLES_PER_BASKET',
  MIN_ORDER_VALUE = 'MIN_ORDER_VALUE',
  ITEM_AVAILABILITY = 'ITEM_AVAILABILITY',
  BUNDLE_AVAILABILITY = 'BUNDLE_AVAILABILITY',
}

/**
 * Basket policy decision
 */
export interface BasketPolicyDecision {
  checksToPerform: BasketPolicyCheckName[];
  reason?: string;
}
