import { Injectable, Inject } from '@nestjs/common';
import { IBasketRepository } from '../../domain/basket/basket.repository';
import {
  BasketEntity,
  BasketSnapshot,
} from '../../domain/basket/basket.entity';
import {
  IPolicyServicePort,
  BasketPolicyCheckName,
  BasketPricingResult,
} from '../ports/policy-service.port';
import {
  BasketSpecificationRegistry,
  BasketSpecificationContext,
} from '../specifications/basket-policy.specification';

/**
 * Commands for basket operations
 */
<<<<<<< Current (Your changes)
export interface AddItemCommand {
  userId: string;
  itemId: string;
  amount?: number;
}

export interface UpdateItemCommand {
  userId: string;
  itemId: string;
  amount: number;
}

export interface RemoveItemCommand {
  userId: string;
  itemId: string;
}

export interface AddBundleCommand {
  userId: string;
  bundleId: string;
  amount?: number;
}

export interface UpdateBundleCommand {
  userId: string;
  bundleId: string;
  amount: number;
}

export interface RemoveBundleCommand {
  userId: string;
  bundleId: string;
=======
export class AddItemDto {
  userId!: string;
  itemId!: string;
  amount?: number;
}

export class UpdateItemDto {
  userId!: string;
  itemId!: string;
  amount!: number;
}

export class RemoveItemDto {
  userId!: string;
  itemId!: string;
}

export class AddBundleDto {
  userId!: string;
  bundleId!: string;
  amount?: number;
}

export class UpdateBundleDto {
  userId!: string;
  bundleId!: string;
  amount!: number;
}

export class RemoveBundleDto {
  userId!: string;
  bundleId!: string;
>>>>>>> Incoming (Background Agent changes)
}

export class BasketValidationResult {
  valid!: boolean;
  failedChecks!: Array<{
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
  async addItem(command: AddItemCommand): Promise<BasketEntity> {
    const basket = await this.basketRepository.getOrCreateForUser(command.userId);
    basket.addItem(command.itemId, command.amount ?? 1);
    return this.basketRepository.save(basket);
  }

  /**
   * Update item amount in basket
   */
  async updateItem(command: UpdateItemCommand): Promise<BasketEntity> {
    const basket = await this.basketRepository.getOrCreateForUser(command.userId);
    basket.updateItemAmount(command.itemId, command.amount);
    return this.basketRepository.save(basket);
  }

  /**
   * Remove item from basket
   */
  async removeItem(command: RemoveItemCommand): Promise<BasketEntity> {
    const basket = await this.basketRepository.getOrCreateForUser(command.userId);
    basket.removeItem(command.itemId);
    return this.basketRepository.save(basket);
  }

  /**
   * Add bundle to basket
   */
  async addBundle(command: AddBundleCommand): Promise<BasketEntity> {
    const basket = await this.basketRepository.getOrCreateForUser(command.userId);
    basket.addBundle(command.bundleId, command.amount ?? 1);
    return this.basketRepository.save(basket);
  }

  /**
   * Update bundle amount in basket
   */
  async updateBundle(command: UpdateBundleCommand): Promise<BasketEntity> {
    const basket = await this.basketRepository.getOrCreateForUser(command.userId);
    basket.updateBundleAmount(command.bundleId, command.amount);
    return this.basketRepository.save(basket);
  }

  /**
   * Remove bundle from basket
   */
  async removeBundle(command: RemoveBundleCommand): Promise<BasketEntity> {
    const basket = await this.basketRepository.getOrCreateForUser(command.userId);
    basket.removeBundle(command.bundleId);
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
