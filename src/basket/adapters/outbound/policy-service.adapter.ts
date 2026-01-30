import { Injectable } from '@nestjs/common';
import {
  PolicyServicePort,
  BasketPolicyCheckName,
  BasketPricingResult,
  PolicySnapshot,
} from '../../application/ports/policy-service.port';
import { BasketSnapshot } from '../../domain/basket/basket.entity';
import { SupportedCurrency } from 'src/_common/domain/enums/currency.enum';

// Mock
@Injectable()
export class PolicyServiceAdapter implements PolicyServicePort {
  async getBasketPolicyChecks(
    basketSnapshot: BasketSnapshot,
  ): Promise<BasketPolicyCheckName[]> {
    return [
      BasketPolicyCheckName.MAX_ITEMS_PER_BASKET,
      BasketPolicyCheckName.MAX_BUNDLES_PER_BASKET,
      BasketPolicyCheckName.MIN_ORDER_VALUE,
      BasketPolicyCheckName.ITEM_AVAILABILITY,
      BasketPolicyCheckName.BUNDLE_AVAILABILITY,
    ];
  }

  async calculateBasketPricing(
    basketSnapshot: BasketSnapshot,
  ): Promise<BasketPricingResult> {

    return {
      items: basketSnapshot.items as any[],
      bundles: basketSnapshot.bundles as any[],
      subtotal: 0,
      totalDiscount: 0,
      total: 0,
      SupportedCurrency: SupportedCurrency.EUR,
    };
  }

  async createPolicySnapshot(
    basketSnapshot: BasketSnapshot,
  ): Promise<PolicySnapshot> {
    const pricing = await this.calculateBasketPricing(basketSnapshot);
    const checksPerformed = await this.getBasketPolicyChecks(basketSnapshot);

    return {
      pricing,
      checksPerformed,
      pricedAt: new Date(),
    };
  }
}
