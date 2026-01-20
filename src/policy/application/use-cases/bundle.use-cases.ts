import { Injectable, Inject } from '@nestjs/common';
import { BundleEntity } from '@policy/domain/price-policy/bundle/bundle.entity';
import { IBundleRepository } from '@policy/domain/price-policy/bundle/bundle.repository';

/**
 * Create bundle DTO
 */
export interface CreateBundleDto {
  name: string;
  description: string;
  basePrice: number;
  discountRate: number;
  items?: Array<{ itemId: string; quantity: number }>;
}

/**
 * Update bundle DTO
 */
export interface UpdateBundleDto {
  name?: string;
  description?: string;
  basePrice?: number;
  discountRate?: number;
  isActive?: boolean;
}

/**
 * Bundle item DTO
 */
export interface BundleItemDto {
  itemId: string;
  quantity: number;
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

    if (dto.name !== undefined) bundle.name = dto.name;
    if (dto.description !== undefined) bundle.description = dto.description;
    if (dto.basePrice !== undefined) bundle.basePrice = dto.basePrice;
    if (dto.discountRate !== undefined)
      bundle.setDiscountRate(dto.discountRate);
    if (dto.isActive !== undefined) {
      dto.isActive ? bundle.activate() : bundle.deactivate();
    }

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
