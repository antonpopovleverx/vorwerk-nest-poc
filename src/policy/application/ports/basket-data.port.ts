export interface BasketSnapshotForPolicy {
  basketId: string;
  userId: string;
  items: Array<{ itemId: string; amount: number }>;
  bundles: Array<{ bundleId: string; amount: number }>;
  snapshotAt: Date;
}
