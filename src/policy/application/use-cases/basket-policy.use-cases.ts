import { Injectable } from '@nestjs/common';
import { BasketPolicyCheckName } from 'src/basket/application/ports/policy-service.port';
import { BasketSnapshotForPolicy } from 'src/policy/application/ports/basket-data.port';

/**
 * Basket policy use cases - determines which policy checks to perform
 */
@Injectable()
export class BasketPolicyUseCases {
  /**
   * Get the list of policy checks that should be performed for a basket
   * This is the "decision point" - returns check names that will be enforced elsewhere
   */
  getBasketPolicyChecks(
    basketSnapshot: BasketSnapshotForPolicy,
  ): BasketPolicyCheckName[] {
    const checks: BasketPolicyCheckName[] = [];

    // Always check max items
    checks.push(BasketPolicyCheckName.MAX_ITEMS_PER_BASKET);

    // Check max bundles if basket has bundles
    if (basketSnapshot.bundles.length > 0) {
      checks.push(BasketPolicyCheckName.MAX_BUNDLES_PER_BASKET);
      checks.push(BasketPolicyCheckName.BUNDLE_AVAILABILITY);
    }

    // Always check item availability if there are items
    if (basketSnapshot.items.length > 0) {
      checks.push(BasketPolicyCheckName.ITEM_AVAILABILITY);
    }

    // Always check minimum order value for checkout
    checks.push(BasketPolicyCheckName.MIN_ORDER_VALUE);

    return checks;
  }

  /**
   * Get all available policy check names
   */
  getAllPolicyCheckNames(): BasketPolicyCheckName[] {
    return Object.values(BasketPolicyCheckName);
  }
}
