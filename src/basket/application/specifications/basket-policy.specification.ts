import { Specification } from 'src/_common/domain/specifications/specification.interface';
import { BasketPolicyCheckName } from 'src/basket/application/ports/policy-service.port';
import { BasketEntity } from 'src/basket/domain/basket/basket.entity';

/**
 * Specification context for basket policy checks
 */
export interface BasketSpecificationContext {
  basket: BasketEntity;
  // Additional context can be added here (e.g., pricing info, availability)
  pricing?: {
    total: number;
  };
}

/**
 * Max items per basket specification
 */
export class MaxItemsPerBasketSpecification extends Specification<BasketSpecificationContext> {
  constructor(private readonly maxItems: number = 50) {
    super();
  }

  isSatisfiedBy(context: BasketSpecificationContext): boolean {
    return context.basket.getTotalItemCount() <= this.maxItems;
  }
}

/**
 * Max bundles per basket specification
 */
export class MaxBundlesPerBasketSpecification extends Specification<BasketSpecificationContext> {
  constructor(private readonly maxBundles: number = 10) {
    super();
  }

  isSatisfiedBy(context: BasketSpecificationContext): boolean {
    return context.basket.getTotalBundleCount() <= this.maxBundles;
  }
}

/**
 * Min order value specification
 */
export class MinOrderValueSpecification extends Specification<BasketSpecificationContext> {
  constructor(private readonly minValue: number = 10) {
    super();
  }

  isSatisfiedBy(context: BasketSpecificationContext): boolean {
    if (!context.pricing) {
      return true; // If no pricing context, skip check
    }
    return context.pricing.total >= this.minValue;
  }
}

/**
 * Item availability specification (placeholder - would check external service)
 */
export class ItemAvailabilitySpecification extends Specification<BasketSpecificationContext> {
  isSatisfiedBy(_context: BasketSpecificationContext): boolean {
    // In real implementation, would check item availability
    // For POC, always returns true
    return true;
  }
}

/**
 * Bundle availability specification (placeholder - would check external service)
 */
export class BundleAvailabilitySpecification extends Specification<BasketSpecificationContext> {
  isSatisfiedBy(_context: BasketSpecificationContext): boolean {
    // In real implementation, would check bundle availability
    // For POC, always returns true
    return true;
  }
}

/**
 * Registry mapping policy check names to specifications
 */
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
