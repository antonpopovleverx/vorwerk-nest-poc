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
  getCheckFailureMessage,
} from '../specifications/basket-policy.specification';
import { ProductAmount } from '../../../_common/domain/value-objects/product-amount.value-object';

/**
 * Neutral basket data structure returned by use cases
 */
export class BasketData {
  basketId: string;
  userId: string;
  items: Array<{
    itemId: string;
    amount: number;
  }>;
  bundles: Array<{
    bundleId: string;
    amount: number;
  }>;
}

/**
 * Commands for basket operations
 */
export class AddItemCommand {
  userId!: string;
  itemId!: string;
  amount?: number;
}

export class UpdateItemCommand {
  userId!: string;
  itemId!: string;
  amount!: number;
}

export class RemoveItemCommand {
  userId!: string;
  itemId!: string;
}

export class AddBundleCommand {
  userId!: string;
  bundleId!: string;
  amount?: number;
}

export class UpdateBundleCommand {
  userId!: string;
  bundleId!: string;
  amount!: number;
}

export class RemoveBundleCommand {
  userId!: string;
  bundleId!: string;
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
   * Convert BasketEntity to neutral BasketData
   */
  private mapEntityToData(basket: BasketEntity): BasketData {
    return {
      basketId: basket.basketId,
      userId: basket.userId,
      items:
        basket.items?.map((i) => ({
          itemId: i.itemId,
          amount: i.amount.value,
        })) ?? [],
      bundles:
        basket.bundles?.map((b) => ({
          bundleId: b.bundleId,
          amount: b.amount.value,
        })) ?? [],
    };
  }

  /**
   * Get basket for user (creates if not exists)
   */
  async getBasketForUser(userId: string): Promise<BasketData> {
    const basket = await this.basketRepository.getOrCreateForUser(userId);

    return this.mapEntityToData(basket);
  }

  /**
   * Add item to basket
   */
  async addItem(command: AddItemCommand): Promise<BasketData> {
    const basket = await this.basketRepository.getOrCreateForUser(
      command.userId,
    );

    const amount = new ProductAmount(command.amount ?? 1);
    basket.addItem(command.itemId, amount);

    const savedBasket = await this.basketRepository.save(basket);

    return this.mapEntityToData(savedBasket);
  }

  /**
   * Update item amount in basket
   */
  async updateItem(command: UpdateItemCommand): Promise<BasketData> {
    const basket = await this.basketRepository.getOrCreateForUser(
      command.userId,
    );

    const amount = new ProductAmount(command.amount);
    basket.updateItemAmount(command.itemId, amount);

    const savedBasket = await this.basketRepository.save(basket);

    return this.mapEntityToData(savedBasket);
  }

  /**
   * Remove item from basket
   */
  async removeItem(command: RemoveItemCommand): Promise<BasketData> {
    const basket = await this.basketRepository.getOrCreateForUser(
      command.userId,
    );

    basket.removeItem(command.itemId);

    const savedBasket = await this.basketRepository.save(basket);

    return this.mapEntityToData(savedBasket);
  }

  /**
   * Add bundle to basket
   */
  async addBundle(command: AddBundleCommand): Promise<BasketData> {
    const basket = await this.basketRepository.getOrCreateForUser(
      command.userId,
    );

    const amount = new ProductAmount(command.amount ?? 1);
    basket.addBundle(command.bundleId, amount);

    const savedBasket = await this.basketRepository.save(basket);

    return this.mapEntityToData(savedBasket);
  }

  /**
   * Update bundle amount in basket
   */
  async updateBundle(command: UpdateBundleCommand): Promise<BasketData> {
    const basket = await this.basketRepository.getOrCreateForUser(
      command.userId,
    );

    const amount = new ProductAmount(command.amount);
    basket.updateBundleAmount(command.bundleId, amount);

    const savedBasket = await this.basketRepository.save(basket);

    return this.mapEntityToData(savedBasket);
  }

  /**
   * Remove bundle from basket
   */
  async removeBundle(command: RemoveBundleCommand): Promise<BasketData> {
    const basket = await this.basketRepository.getOrCreateForUser(
      command.userId,
    );

    basket.removeBundle(command.bundleId);

    const savedBasket = await this.basketRepository.save(basket);

    return this.mapEntityToData(savedBasket);
  }

  /**
   * Clear basket
   */
  async clearBasket(userId: string): Promise<BasketData> {
    const basket = await this.basketRepository.getOrCreateForUser(userId);

    basket.clear();

    const savedBasket = await this.basketRepository.save(basket);

    return this.mapEntityToData(savedBasket);
  }

  /**
   * Get basket pricing
   */
  async getBasketPricing(userId: string): Promise<BasketPricingResult> {
    const basket = await this.basketRepository.getOrCreateForUser(userId);

    const snapshot: BasketSnapshot = basket.createSnapshot();

    return this.policyService.calculateBasketPricing(snapshot);
  }

  /**
   * Validate basket against policy checks
   */
  async validateBasket(userId: string): Promise<BasketValidationResult> {
    const basket = await this.basketRepository.getOrCreateForUser(userId);
    const snapshot = basket.createSnapshot();

    const checkNames: BasketPolicyCheckName[] =
      await this.policyService.getBasketPolicyChecks(snapshot);

    const pricing: BasketPricingResult =
      await this.policyService.calculateBasketPricing(snapshot);

    const context: BasketSpecificationContext = {
      basket,
      pricing: {
        total: pricing.total,
      },
    };

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
            message: getCheckFailureMessage(checkName),
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
}
