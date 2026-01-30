export enum BasketPolicyCheckName {
  MAX_ITEMS_PER_BASKET = 'MAX_ITEMS_PER_BASKET',
  MAX_BUNDLES_PER_BASKET = 'MAX_BUNDLES_PER_BASKET',
  MIN_ORDER_VALUE = 'MIN_ORDER_VALUE',
  ITEM_AVAILABILITY = 'ITEM_AVAILABILITY',
  BUNDLE_AVAILABILITY = 'BUNDLE_AVAILABILITY',
}

export interface BasketPolicyDecision {
  checksToPerform: BasketPolicyCheckName[];
  reason?: string;
}
