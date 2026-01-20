import { Injectable, Inject } from '@nestjs/common';
import { IBasketRepository } from '@basket/domain/basket/basket.repository.js';
import {
  BasketEntity,
  BasketSnapshot,
} from '@basket/domain/basket/basket.entity.js';
import {
  IPolicyServicePort,
  BasketPolicyCheckName,
  BasketPricingResult,
} from '@basket/application/ports/policy-service.port.js';
import {
  BasketSpecificationRegistry,
  BasketSpecificationContext,
} from '@basket/application/specifications/basket-policy.specification.js';

/**
 * DTOs for basket operations
 */
export interface AddItemDto {
  userId: string;
  itemId: string;
  amount?: number;
}

export interface UpdateItemDto {
  userId: string;
  itemId: string;
  amount: number;
}

export interface RemoveItemDto {
  userId: string;
  itemId: string;
}

export interface AddBundleDto {
  userId: string;
  bundleId: string;
  amount?: number;
}

export interface UpdateBundleDto {
  userId: string;
  bundleId: string;
  amount: number;
}

export interface RemoveBundleDto {
  userId: string;
  bundleId: string;
}

export interface BasketValidationResult {
  valid: boolean;
  failedChecks: Array<{
    checkName: BasketPolicyCheckName;
    message: string;
  }>;
}

/**
 * Basket use cases - manages basket operations
 */
@Injectable()
export class BasketUseCases {
  constructor(
    @Inject('IBasketRepository')
    private readonly basketRepository: IBasketRepository,
    @Inject('IPolicyServicePort')
    private readonly policyService: IPolicyServicePort,
  ) {}

  /**
   * Get basket for user (creates if not exists)
   */
  async getBasketForUser(userId: string): Promise<BasketEntity> {
    return this.basketRepository.getOrCreateForUser(userId);
  }

  /**
   * Add item to basket
   */
  async addItem(dto: AddItemDto): Promise<BasketEntity> {
    const basket = await this.basketRepository.getOrCreateForUser(dto.userId);
    basket.addItem(dto.itemId, dto.amount ?? 1);
    return this.basketRepository.save(basket);
  }

  /**
   * Update item amount in basket
   */
  async updateItem(dto: UpdateItemDto): Promise<BasketEntity> {
    const basket = await this.basketRepository.getOrCreateForUser(dto.userId);
    basket.updateItemAmount(dto.itemId, dto.amount);
    return this.basketRepository.save(basket);
  }

  /**
   * Remove item from basket
   */
  async removeItem(dto: RemoveItemDto): Promise<BasketEntity> {
    const basket = await this.basketRepository.getOrCreateForUser(dto.userId);
    basket.removeItem(dto.itemId);
    return this.basketRepository.save(basket);
  }

  /**
   * Add bundle to basket
   */
  async addBundle(dto: AddBundleDto): Promise<BasketEntity> {
    const basket = await this.basketRepository.getOrCreateForUser(dto.userId);
    basket.addBundle(dto.bundleId, dto.amount ?? 1);
    return this.basketRepository.save(basket);
  }

  /**
   * Update bundle amount in basket
   */
  async updateBundle(dto: UpdateBundleDto): Promise<BasketEntity> {
    const basket = await this.basketRepository.getOrCreateForUser(dto.userId);
    basket.updateBundleAmount(dto.bundleId, dto.amount);
    return this.basketRepository.save(basket);
  }

  /**
   * Remove bundle from basket
   */
  async removeBundle(dto: RemoveBundleDto): Promise<BasketEntity> {
    const basket = await this.basketRepository.getOrCreateForUser(dto.userId);
    basket.removeBundle(dto.bundleId);
    return this.basketRepository.save(basket);
  }

  /**
   * Clear basket
   */
  async clearBasket(userId: string): Promise<BasketEntity> {
    const basket = await this.basketRepository.getOrCreateForUser(userId);
    basket.clear();
    return this.basketRepository.save(basket);
  }

  /**
   * Get basket pricing
   */
  async getBasketPricing(userId: string): Promise<BasketPricingResult> {
    const basket = await this.basketRepository.getOrCreateForUser(userId);
    const snapshot = basket.createSnapshot();
    return this.policyService.calculateBasketPricing(snapshot);
  }

  /**
   * Validate basket against policy checks
   */
  async validateBasket(userId: string): Promise<BasketValidationResult> {
    const basket = await this.basketRepository.getOrCreateForUser(userId);
    const snapshot = basket.createSnapshot();

    // Get required policy checks
    const checkNames = await this.policyService.getBasketPolicyChecks(snapshot);

    // Get pricing for specifications that need it
    const pricing = await this.policyService.calculateBasketPricing(snapshot);

    // Build specification context
    const context: BasketSpecificationContext = {
      basket,
      pricing: {
        total: pricing.total,
      },
    };

    // Run all specifications
    const failedChecks: Array<{
      checkName: BasketPolicyCheckName;
      message: string;
    }> = [];

    for (const checkName of checkNames) {
      const specFactory = BasketSpecificationRegistry[checkName];
      if (specFactory) {
        const spec = specFactory();
        if (!spec.isSatisfiedBy(context)) {
          failedChecks.push({
            checkName,
            message: this.getCheckFailureMessage(checkName),
          });
        }
      }
    }

    return {
      valid: failedChecks.length === 0,
      failedChecks,
    };
  }

  /**
   * Get basket snapshot for checkout
   */
  async getBasketSnapshot(userId: string): Promise<BasketSnapshot> {
    const basket = await this.basketRepository.getOrCreateForUser(userId);
    return basket.createSnapshot();
  }

  private getCheckFailureMessage(checkName: BasketPolicyCheckName): string {
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
}
