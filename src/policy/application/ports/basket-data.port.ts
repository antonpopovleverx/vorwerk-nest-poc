/**
 * Basket snapshot for policy calculations
 * This matches the structure from basket subdomain
 */
export interface BasketSnapshotForPolicy {
  basketId: string;
  userId: string;
  items: Array<{ itemId: string; amount: number }>;
  bundles: Array<{ bundleId: string; amount: number }>;
  snapshotAt: Date;
}
