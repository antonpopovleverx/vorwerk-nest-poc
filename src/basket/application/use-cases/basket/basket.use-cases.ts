import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { IBasketRepository } from '../../../domain/basket/basket.repository';
import {
  BasketEntity,
  BasketSnapshot,
} from '../../../domain/basket/basket.entity';
import {
  PolicyServicePort,
  BasketPolicyCheckName,
  BasketPricingResult,
} from '../../ports/policy-service.port';
import type { BasketSpecificationRegistryType } from '../../specifications/basket-policy.specification';
import {
  BASKET_SPECIFICATION_REGISTRY_TOKEN,
  BasketSpecificationContext,
  getCheckFailureMessage,
} from '../../specifications/basket-policy.specification';
import { ProductAmount } from '../../../../_common/domain/value-objects/product-amount.value-object';
import {
  BasketData,
  AddItemCommand,
  UpdateItemCommand,
  RemoveItemCommand,
  AddBundleCommand,
  UpdateBundleCommand,
  RemoveBundleCommand,
  BasketValidationResult,
} from './basket.command';
import { isFound } from 'src/_common/domain/specifications/specification.interface';

@Injectable()
export class BasketUseCases {
  constructor(
    @Inject(IBasketRepository.name)
    private readonly basketRepository: IBasketRepository,
    @Inject(PolicyServicePort.name)
    private readonly policyAdapter: PolicyServicePort,
    @Inject(BASKET_SPECIFICATION_REGISTRY_TOKEN)
    private readonly specificationRegistry: BasketSpecificationRegistryType,
  ) { }

  async getBasketForUser(userId: string): Promise<BasketData> {
    const basket: BasketEntity =
      await this.basketRepository.getOrCreateForUser(userId);

    return this.mapEntityToData(basket);
  }

  async addItem(command: AddItemCommand): Promise<BasketData> {
    const basket: BasketEntity = await this.basketRepository.getOrCreateForUser(
      command.userId,
    );

    const amount: ProductAmount = new ProductAmount(command.amount ?? 1);
    basket.addItem(command.itemId, amount);

    const savedBasket: BasketEntity = await this.basketRepository.save(basket);

    return this.mapEntityToData(savedBasket);
  }

  async updateItem(command: UpdateItemCommand): Promise<BasketData> {
    const basket: BasketEntity = await this.basketRepository.getOrCreateForUser(
      command.userId,
    );

    const amount: ProductAmount = new ProductAmount(command.amount);
    basket.updateItemAmount(command.itemId, amount);

    const savedBasket: BasketEntity = await this.basketRepository.save(basket);

    return this.mapEntityToData(savedBasket);
  }

  async removeItem(command: RemoveItemCommand): Promise<BasketData> {
    const basket: BasketEntity = await this.basketRepository.getOrCreateForUser(
      command.userId,
    );

    basket.removeItem(command.itemId);

    const savedBasket: BasketEntity = await this.basketRepository.save(basket);

    return this.mapEntityToData(savedBasket);
  }

  async addBundle(command: AddBundleCommand): Promise<BasketData> {
    const basket: BasketEntity = await this.basketRepository.getOrCreateForUser(
      command.userId,
    );

    const amount: ProductAmount = new ProductAmount(command.amount ?? 1);
    basket.addBundle(command.bundleId, amount);

    const savedBasket: BasketEntity = await this.basketRepository.save(basket);

    return this.mapEntityToData(savedBasket);
  }

  async updateBundle(command: UpdateBundleCommand): Promise<BasketData> {
    const basket: BasketEntity = await this.basketRepository.getOrCreateForUser(
      command.userId,
    );

    const amount: ProductAmount = new ProductAmount(command.amount);
    basket.updateBundleAmount(command.bundleId, amount);

    const savedBasket: BasketEntity = await this.basketRepository.save(basket);

    return this.mapEntityToData(savedBasket);
  }

  async removeBundle(command: RemoveBundleCommand): Promise<BasketData> {
    const basket: BasketEntity = await this.basketRepository.getOrCreateForUser(
      command.userId,
    );

    basket.removeBundle(command.bundleId);

    const savedBasket: BasketEntity = await this.basketRepository.save(basket);

    return this.mapEntityToData(savedBasket);
  }

  async clearBasket(userId: string): Promise<BasketData> {
    const basket: BasketEntity =
      await this.basketRepository.getOrCreateForUser(userId);

    basket.clear();

    const savedBasket: BasketEntity = await this.basketRepository.save(basket);

    return this.mapEntityToData(savedBasket);
  }

  async getBasketPricing(userId: string): Promise<BasketPricingResult> {
    const basket: BasketEntity =
      await this.basketRepository.getOrCreateForUser(userId);

    const snapshot: BasketSnapshot = basket.createSnapshot();

    return this.policyAdapter.calculateBasketPricing(snapshot);
  }

  async validateBasket(userId: string): Promise<BasketValidationResult> {
    const basket: BasketEntity =
      await this.basketRepository.getOrCreateForUser(userId);
    const snapshot: BasketSnapshot = basket.createSnapshot();

    const checkNames: BasketPolicyCheckName[] =
      await this.policyAdapter.getBasketPolicyChecks(snapshot);

    const pricing: BasketPricingResult =
      await this.policyAdapter.calculateBasketPricing(snapshot);

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
      const specFactory = this.specificationRegistry[checkName];
      if (!isFound(specFactory)) {
        throw new HttpException('Specification factory not found', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      const spec = specFactory();

      if (!spec.isSatisfiedBy(context)) {
        failedChecks.push({
          checkName,
          message: getCheckFailureMessage(checkName),
        });
      }
    }

    return {
      valid: failedChecks.length === 0,
      failedChecks,
    };
  }

  async getBasketSnapshot(userId: string): Promise<BasketSnapshot> {
    const basket: BasketEntity =
      await this.basketRepository.getOrCreateForUser(userId);

    return basket.createSnapshot();
  }

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
}
