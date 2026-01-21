import { Injectable, Inject } from '@nestjs/common';
import { BundleEntity } from '../../domain/price-policy/bundle.entity';
import { IBundleRepository } from '../../domain/price-policy/bundle.repository';

/**
 * Create bundle DTO
 */
export class CreateBundleDto {
  name!: string;
  description!: string;
  basePrice!: number;
  discountRate!: number;
  items?: Array<{ itemId: string; quantity: number }>;
}

/**
 * Update bundle DTO
 */
export class UpdateBundleDto {
  name?: string;
  description?: string;
  basePrice?: number;
  discountRate?: number;
  isActive?: boolean;
}

/**
 * Bundle item DTO
 */
export class BundleItemDto {
  itemId!: string;
  quantity!: number;
}

/**
 * Bundle use cases - manages bundle CRUD and content
 */
@Injectable()
export class BundleUseCases {
  constructor(
    @Inject('IBundleRepository')
    private readonly bundleRepository: IBundleRepository,
  ) {}

  /**
   * Create a new bundle
   */
  async createBundle(dto: CreateBundleDto): Promise<BundleEntity> {
    const bundle = BundleEntity.create(
      dto.name,
      dto.description,
      dto.basePrice,
      dto.discountRate,
    );

    if (dto.items) {
      for (const item of dto.items) {
        bundle.addItem(item.itemId, item.quantity);
      }
    }

    return this.bundleRepository.save(bundle);
  }

  /**
   * Get bundle by ID
   */
  async getBundle(bundleId: string): Promise<BundleEntity | null> {
    return this.bundleRepository.findById(bundleId);
  }

  /**
   * Get all bundles
   */
  async getAllBundles(): Promise<BundleEntity[]> {
    return this.bundleRepository.findAll();
  }

  /**
   * Get active bundles only
   */
  async getActiveBundles(): Promise<BundleEntity[]> {
    return this.bundleRepository.findActive();
  }

  /**
   * Update bundle
   */
  async updateBundle(
    bundleId: string,
    dto: UpdateBundleDto,
  ): Promise<BundleEntity | null> {
    const bundle = await this.bundleRepository.findById(bundleId);
    if (!bundle) return null;

    bundle.updateFromDto(dto);

    return this.bundleRepository.save(bundle);
  }

  /**
   * Delete bundle
   */
  async deleteBundle(bundleId: string): Promise<void> {
    await this.bundleRepository.delete(bundleId);
  }

  /**
   * Add item to bundle
   */
  async addItemToBundle(
    bundleId: string,
    item: BundleItemDto,
  ): Promise<BundleEntity | null> {
    const bundle = await this.bundleRepository.findById(bundleId);
    if (!bundle) return null;

    bundle.addItem(item.itemId, item.quantity);
    return this.bundleRepository.save(bundle);
  }

  /**
   * Remove item from bundle
   */
  async removeItemFromBundle(
    bundleId: string,
    itemId: string,
  ): Promise<BundleEntity | null> {
    const bundle = await this.bundleRepository.findById(bundleId);
    if (!bundle) return null;

    bundle.removeItem(itemId);
    return this.bundleRepository.save(bundle);
  }

  /**
   * Update item quantity in bundle
   */
  async updateBundleItemQuantity(
    bundleId: string,
    itemId: string,
    quantity: number,
  ): Promise<BundleEntity | null> {
    const bundle = await this.bundleRepository.findById(bundleId);
    if (!bundle) return null;

    bundle.updateItemQuantity(itemId, quantity);
    return this.bundleRepository.save(bundle);
  }
}
