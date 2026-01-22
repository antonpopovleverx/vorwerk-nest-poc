import { Injectable, Inject } from '@nestjs/common';
import {
  Currency,
  DEFAULT_CURRENCY,
} from 'src/_common/domain/enums/currency.enum';
import { Region, DEFAULT_REGION } from 'src/_common/domain/enums/region.enum';
import { BasketSnapshotForPolicy } from 'src/policy/application/ports/basket-data.port';
import { IBundleRepository } from 'src/policy/domain/price-policy/bundle.repository';
import { IPricePolicyRepository } from 'src/policy/domain/price-policy/price-policy.repository';
import { BundleEntity } from '../../domain/price-policy/bundle.entity';
import { ItemPriceEntity } from '../../domain/price-policy/item-price.entity';
import { ItemDiscountEntity } from '../../domain/price-policy/item-discount.entity';
import { isFound } from '../../../_common/domain/specifications/specification.interface';

/**
 * Item pricing result
 */
export class ItemPricingResult {
  itemId!: string;
  amount!: number;
  unitPrice!: number;
  discount!: number;
  totalPrice!: number;
}

/**
 * Bundle pricing result
 */
export class BundlePricingResult {
  bundleId!: string;
  amount!: number;
  unitPrice!: number;
  discount!: number;
  totalPrice!: number;
}

/**
 * Full basket pricing result
 */
export class BasketPricingResult {
  items!: ItemPricingResult[];
  bundles!: BundlePricingResult[];
  subtotal!: number;
  totalDiscount!: number;
  total!: number;
  currency!: Currency;
}

/**
 * Price policy use cases
 */
@Injectable()
export class PricePolicyUseCases {
  private readonly region: Region = DEFAULT_REGION; // Hardcoded to DE for POC

  constructor(
    @Inject(IPricePolicyRepository.name)
    private readonly pricePolicyRepository: IPricePolicyRepository,
    @Inject(IBundleRepository.name)
    private readonly bundleRepository: IBundleRepository,
  ) {}

  /**
   * Calculate pricing for a basket snapshot
   */
  async calculateBasketPricing(
    basketSnapshot: BasketSnapshotForPolicy,
  ): Promise<BasketPricingResult> {
    const itemResults: ItemPricingResult[] = [];
    const bundleResults: BundlePricingResult[] = [];
    let subtotal: number = 0;
    let totalDiscount: number = 0;

    // Calculate item pricing
    if (basketSnapshot.items.length > 0) {
      const itemIds = basketSnapshot.items.map((i) => i.itemId);
      const prices: ItemPriceEntity[] =
        await this.pricePolicyRepository.getItemPrices(itemIds, this.region);
      const discounts: ItemDiscountEntity[] =
        await this.pricePolicyRepository.getActiveItemDiscounts(
          itemIds,
          this.region,
        );

      const priceMap: Map<string, number> = new Map(
        prices.map((p) => [p.itemId, p.getPrice()]),
      );
      const discountMap: Map<string, number> = new Map(
        discounts
          .filter((d) => d.isCurrentlyValid())
          .map((d) => [d.itemId, d.getDiscountRate()]),
      );

      for (const item of basketSnapshot.items) {
        const unitPrice: number = priceMap.get(item.itemId) ?? 0;
        const discountRate: number = discountMap.get(item.itemId) ?? 0;
        const discountAmount: number = unitPrice * discountRate;
        const finalUnitPrice: number = unitPrice - discountAmount;
        const totalPrice: number =
          Math.round(finalUnitPrice * item.amount * 100) / 100;
        const itemDiscount: number =
          Math.round(discountAmount * item.amount * 100) / 100;

        itemResults.push({
          itemId: item.itemId,
          amount: item.amount,
          unitPrice,
          discount: itemDiscount,
          totalPrice,
        });

        subtotal += unitPrice * item.amount;
        totalDiscount += itemDiscount;
      }
    }

    // Calculate bundle pricing
    if (basketSnapshot.bundles.length > 0) {
      const bundleIds = basketSnapshot.bundles.map((b) => b.bundleId);
      const bundles: BundleEntity[] =
        await this.bundleRepository.findByIds(bundleIds);
      const bundleMap: Map<string, BundleEntity> = new Map(
        bundles.map((b) => [b.bundleId, b]),
      );

      for (const basketBundle of basketSnapshot.bundles) {
        const bundle: BundleEntity | undefined = bundleMap.get(
          basketBundle.bundleId,
        );
        if (isFound(bundle)) {
          const unitPrice: number = bundle.basePrice.amount;
          const discountAmount: number = bundle.getDiscountAmount().amount;
          const finalUnitPrice: number = bundle.getDiscountedPrice().amount;
          const totalPrice: number =
            Math.round(finalUnitPrice * basketBundle.amount * 100) / 100;
          const bundleDiscount: number =
            Math.round(discountAmount * basketBundle.amount * 100) / 100;

          bundleResults.push({
            bundleId: basketBundle.bundleId,
            amount: basketBundle.amount,
            unitPrice,
            discount: bundleDiscount,
            totalPrice,
          });

          subtotal += unitPrice * basketBundle.amount;
          totalDiscount += bundleDiscount;
        }
      }
    }

    const total = Math.round((subtotal - totalDiscount) * 100) / 100;
    subtotal = Math.round(subtotal * 100) / 100;
    totalDiscount = Math.round(totalDiscount * 100) / 100;

    return {
      items: itemResults,
      bundles: bundleResults,
      subtotal,
      totalDiscount,
      total,
      currency: DEFAULT_CURRENCY,
    };
  }

  /**
   * Get price for a single item
   */
  async getItemPrice(itemId: string): Promise<number | null> {
    const price = await this.pricePolicyRepository.getItemPrice(
      itemId,
      this.region,
    );

    return price?.getPrice() ?? null;
  }

  /**
   * Get active discount for a single item
   */
  async getItemDiscount(itemId: string): Promise<number | null> {
    const discount = await this.pricePolicyRepository.getActiveItemDiscount(
      itemId,
      this.region,
    );
    if (discount?.isCurrentlyValid()) {
      return discount.getDiscountRate();
    }

    return null;
  }

  /**
   * Get bundle pricing
   */
  async getBundlePricing(bundleId: string): Promise<{
    basePrice: number;
    discountedPrice: number;
    discountRate: number;
  } | null> {
    const bundle: BundleEntity | null =
      await this.bundleRepository.findById(bundleId);
    if (!isFound(bundle)) return null;

    return {
      basePrice: bundle.basePrice.amount,
      discountedPrice: bundle.getDiscountedPrice().amount,
      discountRate: Number(bundle.discountRate),
    };
  }
}
