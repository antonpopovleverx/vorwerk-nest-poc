import { Injectable, Inject } from '@nestjs/common';
import {
  Currency,
  DEFAULT_CURRENCY,
} from 'src/_common/domain/enums/currency.enum';
import { Region, DEFAULT_REGION } from 'src/_common/domain/enums/region.enum';
import { BasketSnapshotForPolicy } from 'src/policy/application/ports/basket-data.port';
import { IBundleRepository } from 'src/policy/domain/price-policy/bundle.repository';
import { IPricePolicyRepository } from 'src/policy/domain/price-policy/price-policy.repository';
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
    @Inject('IPricePolicyRepository')
    private readonly pricePolicyRepository: IPricePolicyRepository,
    @Inject('IBundleRepository')
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
    let subtotal = 0;
    let totalDiscount = 0;

    // Calculate item pricing
    if (basketSnapshot.items.length > 0) {
      const itemIds = basketSnapshot.items.map((i) => i.itemId);
      const prices = await this.pricePolicyRepository.getItemPrices(
        itemIds,
        this.region,
      );
      const discounts = await this.pricePolicyRepository.getActiveItemDiscounts(
        itemIds,
        this.region,
      );

      const priceMap = new Map(prices.map((p) => [p.itemId, p.getPrice()]));
      const discountMap = new Map(
        discounts
          .filter((d) => d.isCurrentlyValid())
          .map((d) => [d.itemId, d.getDiscountRate()]),
      );

      for (const item of basketSnapshot.items) {
        const unitPrice = priceMap.get(item.itemId) ?? 0;
        const discountRate = discountMap.get(item.itemId) ?? 0;
        const discountAmount = unitPrice * discountRate;
        const finalUnitPrice = unitPrice - discountAmount;
        const totalPrice = Math.round(finalUnitPrice * item.amount * 100) / 100;
        const itemDiscount =
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
      const bundles = await this.bundleRepository.findByIds(bundleIds);
      const bundleMap = new Map(bundles.map((b) => [b.bundleId, b]));

      for (const basketBundle of basketSnapshot.bundles) {
        const bundle = bundleMap.get(basketBundle.bundleId);
        if (isFound(bundle)) {
          const unitPrice = bundle.basePrice.amount;
          const discountAmount = bundle.getDiscountAmount().amount;
          const finalUnitPrice = bundle.getDiscountedPrice().amount;
          const totalPrice =
            Math.round(finalUnitPrice * basketBundle.amount * 100) / 100;
          const bundleDiscount =
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
    const bundle = await this.bundleRepository.findById(bundleId);
    if (!isFound(bundle)) return null;

    return {
      basePrice: bundle.basePrice.amount,
      discountedPrice: bundle.getDiscountedPrice().amount,
      discountRate: Number(bundle.discountRate),
    };
  }
}
