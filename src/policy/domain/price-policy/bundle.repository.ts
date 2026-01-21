import { BundleEntity } from './bundle.entity';

/**
 * Bundle repository port
 */
export abstract class IBundleRepository {
  abstract findById(bundleId: string): Promise<BundleEntity | null>;
  abstract findByIds(bundleIds: string[]): Promise<BundleEntity[]>;
  abstract findAll(): Promise<BundleEntity[]>;
  abstract findActive(): Promise<BundleEntity[]>;
  abstract save(bundle: BundleEntity): Promise<BundleEntity>;
  abstract delete(bundleId: string): Promise<void>;
}
