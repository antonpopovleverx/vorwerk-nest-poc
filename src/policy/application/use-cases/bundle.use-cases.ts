import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { BundleEntity } from '../../domain/price-policy/bundle.entity';
import { IBundleRepository } from '../../domain/price-policy/bundle.repository';
import { ProductAmount } from '../../../_common/domain/value-objects/product-amount.value-object';
import { Money } from '../../../_common/domain/value-objects/money.value-object';
import { Currency } from '../../../_common/domain/enums/currency.enum';
import { isFound } from '../../../_common/domain/specifications/specification.interface';

/**
 * Neutral bundle data structure returned by use cases
 */
export class BundleData {
  bundleId: string;
  name: string;
  description: string;
  basePrice: number;
  discountRate: number;
  discountedPrice: number;
  isActive: boolean;
  contents: Array<{
    itemId: string;
    quantity: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create bundle command
 */
export class CreateBundleCommand {
  name!: string;
  description!: string;
  basePrice!: number;
  discountRate!: number;
  items?: Array<{ itemId: string; quantity: number }>;
}

/**
 * Update bundle command
 */
export class UpdateBundleCommand {
  name?: string;
  description?: string;
  basePrice?: number;
  discountRate?: number;
  isActive?: boolean;
}

/**
 * Bundle item command
 */
export class BundleItemCommand {
  itemId!: string;
  quantity!: number;
}

// Internal command with ProductAmount
class BundleItemWithAmountCommand {
  itemId!: string;
  quantity!: ProductAmount;
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
   * Convert BundleEntity to neutral BundleData
   */
  private mapEntityToData(bundle: BundleEntity): BundleData {
    return {
      bundleId: bundle.bundleId,
      name: bundle.name,
      description: bundle.description,
      basePrice: bundle.basePrice.amount,
      discountRate: bundle.discountRate,
      discountedPrice: bundle.getDiscountedPrice().amount,
      isActive: bundle.isActive,
      contents:
        bundle.contents?.map((c) => ({
          itemId: c.itemId,
          quantity: c.amount.value,
        })) ?? [],
      createdAt: bundle.createdAt,
      updatedAt: bundle.updatedAt,
    };
  }

  /**
   * Create a new bundle
   */
  async createBundle(command: CreateBundleCommand): Promise<BundleData> {
    const basePrice = new Money(command.basePrice, Currency.EUR);
    const bundle = BundleEntity.create(
      command.name,
      command.description,
      basePrice,
      command.discountRate,
    );

    if (command.items) {
      for (const item of command.items) {
        const quantity = new ProductAmount(item.quantity);
        bundle.addItem(item.itemId, quantity);
      }
    }

    const savedBundle = await this.bundleRepository.save(bundle);

    return this.mapEntityToData(savedBundle);
  }

  /**
   * Get bundle by ID
   */
  async getBundle(bundleId: string): Promise<BundleData> {
    const bundle = await this.bundleRepository.findById(bundleId);
    if (!isFound(bundle)) {
      throw new HttpException(
        `Bundle ${bundleId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.mapEntityToData(bundle);
  }

  /**
   * Get all bundles
   */
  async getAllBundles(): Promise<BundleData[]> {
    const bundles = await this.bundleRepository.findAll();

    return bundles.map((bundle) => this.mapEntityToData(bundle));
  }

  /**
   * Get active bundles only
   */
  async getActiveBundles(): Promise<BundleData[]> {
    const bundles = await this.bundleRepository.findActive();

    return bundles.map((bundle) => this.mapEntityToData(bundle));
  }

  /**
   * Update bundle
   */
  async updateBundle(
    bundleId: string,
    command: UpdateBundleCommand,
  ): Promise<BundleData> {
    const bundle = await this.bundleRepository.findById(bundleId);
    if (!isFound(bundle)) {
      throw new HttpException(
        `Bundle ${bundleId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Convert basePrice to Money if provided
    const bundlePatch = {
      ...command,
      basePrice:
        command.basePrice !== undefined
          ? new Money(command.basePrice, bundle.basePrice.currency)
          : undefined,
    };

    bundle.setNew(bundlePatch);

    const savedBundle = await this.bundleRepository.save(bundle);

    return this.mapEntityToData(savedBundle);
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
    item: BundleItemCommand,
  ): Promise<BundleData> {
    const bundle = await this.bundleRepository.findById(bundleId);
    if (!isFound(bundle)) {
      throw new HttpException(
        `Bundle ${bundleId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const quantity = new ProductAmount(item.quantity);
    bundle.addItem(item.itemId, quantity);

    const savedBundle = await this.bundleRepository.save(bundle);

    return this.mapEntityToData(savedBundle);
  }

  /**
   * Remove item from bundle
   */
  async removeItemFromBundle(
    bundleId: string,
    itemId: string,
  ): Promise<BundleData> {
    const bundle = await this.bundleRepository.findById(bundleId);
    if (!isFound(bundle)) {
      throw new HttpException(
        `Bundle ${bundleId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    bundle.removeItem(itemId);

    const savedBundle = await this.bundleRepository.save(bundle);

    return this.mapEntityToData(savedBundle);
  }

  /**
   * Update item quantity in bundle
   */
  async updateBundleItemQuantity(
    bundleId: string,
    itemId: string,
    quantity: number,
  ): Promise<BundleData> {
    const bundle = await this.bundleRepository.findById(bundleId);
    if (!isFound(bundle)) {
      throw new HttpException(
        `Bundle ${bundleId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const productAmount = new ProductAmount(quantity);
    bundle.updateItemQuantity(itemId, productAmount);

    const savedBundle = await this.bundleRepository.save(bundle);

    return this.mapEntityToData(savedBundle);
  }
}
