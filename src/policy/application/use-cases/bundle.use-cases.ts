import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { BundleEntity } from '../../domain/price-policy/bundle.entity';
import { IBundleRepository } from '../../domain/price-policy/bundle.repository';
import { ProductAmount } from '../../../_common/domain/value-objects/product-amount.value-object';
import { Money } from '../../../_common/domain/value-objects/money.value-object';
import { SupportedCurrency } from '../../../_common/domain/enums/currency.enum';
import { isFound } from '../../../_common/domain/specifications/specification.interface';

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

export class CreateBundleCommand {
  name!: string;
  description!: string;
  basePrice!: number;
  discountRate!: number;
  items?: Array<{ itemId: string; quantity: number }>;
}

export class UpdateBundleCommand {
  name?: string;
  description?: string;
  basePrice?: number;
  discountRate?: number;
  isActive?: boolean;
}

export class BundleItemCommand {
  itemId!: string;
  quantity!: number;
}

class BundleItemWithAmountCommand {
  itemId!: string;
  quantity!: ProductAmount;
}

@Injectable()
export class BundleUseCases {
  constructor(
    @Inject(IBundleRepository.name)
    private readonly bundleRepository: IBundleRepository,
  ) {}

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

  async createBundle(command: CreateBundleCommand): Promise<BundleData> {
    const basePrice: Money = new Money(command.basePrice, SupportedCurrency.EUR);
    const bundle: BundleEntity = BundleEntity.create(
      command.name,
      command.description,
      basePrice,
      command.discountRate,
    );

    if (command.items) {
      for (const item of command.items) {
        const quantity: ProductAmount = new ProductAmount(item.quantity);
        bundle.addItem(item.itemId, quantity);
      }
    }

    const savedBundle: BundleEntity = await this.bundleRepository.save(bundle);

    return this.mapEntityToData(savedBundle);
  }

  async getBundle(bundleId: string): Promise<BundleData> {
    const bundle: BundleEntity | null =
      await this.bundleRepository.findById(bundleId);
    if (!isFound(bundle)) {
      throw new HttpException(
        `Bundle ${bundleId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.mapEntityToData(bundle);
  }

  async getAllBundles(): Promise<BundleData[]> {
    const bundles: BundleEntity[] = await this.bundleRepository.findAll();

    return bundles.map((bundle) => this.mapEntityToData(bundle));
  }

  async getActiveBundles(): Promise<BundleData[]> {
    const bundles: BundleEntity[] = await this.bundleRepository.findActive();

    return bundles.map((bundle) => this.mapEntityToData(bundle));
  }

  async updateBundle(
    bundleId: string,
    command: UpdateBundleCommand,
  ): Promise<BundleData> {
    const bundle: BundleEntity | null =
      await this.bundleRepository.findById(bundleId);
    if (!isFound(bundle)) {
      throw new HttpException(
        `Bundle ${bundleId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const bundlePatch = {
      ...command,
      basePrice:
        command.basePrice !== undefined
          ? new Money(command.basePrice, bundle.basePrice.SupportedCurrency)
          : undefined,
    };

    bundle.setNew(bundlePatch);

    const savedBundle: BundleEntity = await this.bundleRepository.save(bundle);

    return this.mapEntityToData(savedBundle);
  }

  async deleteBundle(bundleId: string): Promise<void> {
    await this.bundleRepository.delete(bundleId);
  }

  async addItemToBundle(
    bundleId: string,
    item: BundleItemCommand,
  ): Promise<BundleData> {
    const bundle: BundleEntity | null =
      await this.bundleRepository.findById(bundleId);
    if (!isFound(bundle)) {
      throw new HttpException(
        `Bundle ${bundleId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const quantity: ProductAmount = new ProductAmount(item.quantity);
    bundle.addItem(item.itemId, quantity);

    const savedBundle: BundleEntity = await this.bundleRepository.save(bundle);

    return this.mapEntityToData(savedBundle);
  }

  async removeItemFromBundle(
    bundleId: string,
    itemId: string,
  ): Promise<BundleData> {
    const bundle: BundleEntity | null =
      await this.bundleRepository.findById(bundleId);
    if (!isFound(bundle)) {
      throw new HttpException(
        `Bundle ${bundleId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    bundle.removeItem(itemId);

    const savedBundle: BundleEntity = await this.bundleRepository.save(bundle);

    return this.mapEntityToData(savedBundle);
  }

  async updateBundleItemQuantity(
    bundleId: string,
    itemId: string,
    quantity: number,
  ): Promise<BundleData> {
    const bundle: BundleEntity | null =
      await this.bundleRepository.findById(bundleId);
    if (!isFound(bundle)) {
      throw new HttpException(
        `Bundle ${bundleId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const productAmount: ProductAmount = new ProductAmount(quantity);
    bundle.updateItemQuantity(itemId, productAmount);

    const savedBundle: BundleEntity = await this.bundleRepository.save(bundle);

    return this.mapEntityToData(savedBundle);
  }
}
