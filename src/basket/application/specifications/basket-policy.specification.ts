import { Specification } from 'src/_common/domain/specifications/specification.interface';
import { BasketPolicyCheckName } from 'src/basket/application/ports/policy-service.port';
import { BasketEntity } from 'src/basket/domain/basket/basket.entity';

export interface BasketSpecificationContext {
  basket: BasketEntity;
  pricing?: {
    total: number;
  };
}

export class MaxItemsPerBasketSpecification extends Specification<BasketSpecificationContext> {
  constructor(private readonly maxItems: number = 50) {
    super();
  }

  isSatisfiedBy(context: BasketSpecificationContext): boolean {
    return context.basket.getTotalItemCount() <= this.maxItems;
  }
}

export class MaxBundlesPerBasketSpecification extends Specification<BasketSpecificationContext> {
  constructor(private readonly maxBundles: number = 10) {
    super();
  }

  isSatisfiedBy(context: BasketSpecificationContext): boolean {
    return context.basket.getTotalBundleCount() <= this.maxBundles;
  }
}

export class MinOrderValueSpecification extends Specification<BasketSpecificationContext> {
  constructor(private readonly minValue: number = 10) {
    super();
  }

  isSatisfiedBy(context: BasketSpecificationContext): boolean {
    if (!context.pricing) {
      return true;
    }
    return context.pricing.total >= this.minValue;
  }
}

export class ItemAvailabilitySpecification extends Specification<BasketSpecificationContext> {
  isSatisfiedBy(_context: BasketSpecificationContext): boolean {
    return true;
  }
}

export class BundleAvailabilitySpecification extends Specification<BasketSpecificationContext> {
  isSatisfiedBy(_context: BasketSpecificationContext): boolean {
    return true;
  }
}

export const BasketSpecificationRegistry: Record<
  BasketPolicyCheckName,
  () => Specification<BasketSpecificationContext>
> = {
  [BasketPolicyCheckName.MAX_ITEMS_PER_BASKET]: () =>
    new MaxItemsPerBasketSpecification(),
  [BasketPolicyCheckName.MAX_BUNDLES_PER_BASKET]: () =>
    new MaxBundlesPerBasketSpecification(),
  [BasketPolicyCheckName.MIN_ORDER_VALUE]: () =>
    new MinOrderValueSpecification(),
  [BasketPolicyCheckName.ITEM_AVAILABILITY]: () =>
    new ItemAvailabilitySpecification(),
  [BasketPolicyCheckName.BUNDLE_AVAILABILITY]: () =>
    new BundleAvailabilitySpecification(),
};

export function getCheckFailureMessage(
  checkName: BasketPolicyCheckName,
): string {
  const messages: Record<BasketPolicyCheckName, string> = {
    [BasketPolicyCheckName.MAX_ITEMS_PER_BASKET]:
      'Maximum number of items per basket exceeded',
    [BasketPolicyCheckName.MAX_BUNDLES_PER_BASKET]:
      'Maximum number of bundles per basket exceeded',
    [BasketPolicyCheckName.MIN_ORDER_VALUE]:
      'Order value is below minimum required',
    [BasketPolicyCheckName.ITEM_AVAILABILITY]:
      'One or more items are not available',
    [BasketPolicyCheckName.BUNDLE_AVAILABILITY]:
      'One or more bundles are not available',
  };
  return messages[checkName] || 'Policy check failed';
}
