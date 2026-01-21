import { Injectable, Inject } from '@nestjs/common';
import { BundleEntity } from '../../domain/price-policy/bundle.entity';
import { IBundleRepository } from '../../domain/price-policy/bundle.repository';
import { ProductAmount } from '../../../_common/domain/value-objects/product-amount.value-object';
import { Money } from '../../../_common/domain/value-objects/money.value-object';
import { Currency } from '../../../_common/domain/enums/currency.enum';

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
   * Create a new bundle
   */
  async createBundle(command: CreateBundleCommand): Promise<BundleEntity> {
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
    command: UpdateBundleCommand,
  ): Promise<BundleEntity | null> {
    const bundle = await this.bundleRepository.findById(bundleId);
    if (!bundle) return null;

    // Convert basePrice to Money if provided
    const updateDto = {
      ...command,
      basePrice:
        command.basePrice !== undefined
          ? new Money(command.basePrice, bundle.basePrice.currency)
          : undefined,
    };

    bundle.updateFromDto(updateDto);
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
    item: BundleItemCommand,
  ): Promise<BundleEntity | null> {
    const bundle = await this.bundleRepository.findById(bundleId);
    if (!bundle) return null;

    const quantity = new ProductAmount(item.quantity);
    bundle.addItem(item.itemId, quantity);
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

    const productAmount = new ProductAmount(quantity);
    bundle.updateItemQuantity(itemId, productAmount);
    return this.bundleRepository.save(bundle);
  }
}
