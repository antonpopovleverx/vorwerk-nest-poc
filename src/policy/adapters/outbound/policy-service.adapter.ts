import { Injectable } from '@nestjs/common';
import {
  PolicyServicePort,
  BasketPolicyCheckName,
  BasketPricingResult,
  PolicySnapshot,
} from '../../../basket/application/ports/policy-service.port';
import { BasketSnapshot } from '../../../basket/domain/basket/basket.entity';
import { BasketPolicyUseCases } from 'src/policy/application/use-cases/basket-policy.use-cases';
import { PricePolicyUseCases } from 'src/policy/application/use-cases/price-policy.use-cases';

@Injectable()
export class PolicyServiceAdapter implements PolicyServicePort {
  constructor(
    private readonly pricePolicyUseCases: PricePolicyUseCases,
    private readonly basketPolicyUseCases: BasketPolicyUseCases,
  ) {}

  async getBasketPolicyChecks(
    basketSnapshot: BasketSnapshot,
  ): Promise<BasketPolicyCheckName[]> {
    const policyChecks = this.basketPolicyUseCases.getBasketPolicyChecks({
      basketId: basketSnapshot.basketId,
      userId: basketSnapshot.userId,
      items: basketSnapshot.items,
      bundles: basketSnapshot.bundles,
      snapshotAt: basketSnapshot.snapshotAt,
    });

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
          return check;
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
