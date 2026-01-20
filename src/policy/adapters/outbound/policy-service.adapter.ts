import { Injectable } from '@nestjs/common';
import {
  IPolicyServicePort,
  BasketPolicyCheckName,
  BasketPricingResult,
  PolicySnapshot,
} from '../../../basket/application/ports/policy-service.port.js';
import { BasketSnapshot } from '../../../basket/domain/basket/basket.entity.js';
import { PricePolicyUseCases } from '@policy/application/use-cases/price-policy.use-cases.js';
import { BasketPolicyUseCases } from '@policy/application/use-cases/basket-policy.use-cases.js';

/**
 * Adapter implementing IPolicyServicePort for basket subdomain
 * This bridges basket subdomain to policy subdomain
 */
@Injectable()
export class PolicyServiceAdapter implements IPolicyServicePort {
  constructor(
    private readonly pricePolicyUseCases: PricePolicyUseCases,
    private readonly basketPolicyUseCases: BasketPolicyUseCases,
  ) {}

  async getBasketPolicyChecks(
    basketSnapshot: BasketSnapshot,
  ): Promise<BasketPolicyCheckName[]> {
    // Map to policy subdomain's expected format
    const policyChecks = this.basketPolicyUseCases.getBasketPolicyChecks({
      basketId: basketSnapshot.basketId,
      userId: basketSnapshot.userId,
      items: basketSnapshot.items,
      bundles: basketSnapshot.bundles,
      snapshotAt: basketSnapshot.snapshotAt,
    });

    // Map policy subdomain check names to basket subdomain check names
    return policyChecks.map((check) => {
      switch (check) {
        case 'MAX_ITEMS_PER_BASKET':
          return BasketPolicyCheckName.MAX_ITEMS_PER_BASKET;
        case 'MAX_BUNDLES_PER_BASKET':
          return BasketPolicyCheckName.MAX_BUNDLES_PER_BASKET;
        case 'MIN_ORDER_VALUE':
          return BasketPolicyCheckName.MIN_ORDER_VALUE;
        case 'ITEM_AVAILABILITY':
          return BasketPolicyCheckName.ITEM_AVAILABILITY;
        case 'BUNDLE_AVAILABILITY':
          return BasketPolicyCheckName.BUNDLE_AVAILABILITY;
        default:
          return check as BasketPolicyCheckName;
      }
    });
  }

  async calculateBasketPricing(
    basketSnapshot: BasketSnapshot,
  ): Promise<BasketPricingResult> {
    const pricing = await this.pricePolicyUseCases.calculateBasketPricing({
      basketId: basketSnapshot.basketId,
      userId: basketSnapshot.userId,
      items: basketSnapshot.items,
      bundles: basketSnapshot.bundles,
      snapshotAt: basketSnapshot.snapshotAt,
    });

    return pricing;
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
