import { Injectable } from '@nestjs/common';
import { BasketPolicyCheckName } from 'src/basket/application/ports/policy-service.port';
import { BasketSnapshotForPolicy } from 'src/policy/application/ports/basket-data.port';

@Injectable()
export class BasketPolicyUseCases {
  getBasketPolicyChecks(
    basketSnapshot: BasketSnapshotForPolicy,
  ): BasketPolicyCheckName[] {
    const checks: BasketPolicyCheckName[] = [];

    checks.push(BasketPolicyCheckName.MAX_ITEMS_PER_BASKET);

    if (basketSnapshot.bundles.length > 0) {
      checks.push(BasketPolicyCheckName.MAX_BUNDLES_PER_BASKET);
      checks.push(BasketPolicyCheckName.BUNDLE_AVAILABILITY);
    }

    if (basketSnapshot.items.length > 0) {
      checks.push(BasketPolicyCheckName.ITEM_AVAILABILITY);
    }

    checks.push(BasketPolicyCheckName.MIN_ORDER_VALUE);

    return checks;
  }

  getAllPolicyCheckNames(): BasketPolicyCheckName[] {
    return Object.values(BasketPolicyCheckName);
  }
}
