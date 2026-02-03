import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { IBasketRepository } from '../../../domain/basket/basket.repository';
import { BasketEntity } from '../../../domain/basket/basket.entity';
import {
  PolicyServicePort,
  PolicySnapshot,
  BasketPolicyCheckName,
  BasketPricingResult,
} from '../../ports/policy-service.port';
import {
  OrderServicePort,
  CreateQuoteResult,
} from '../../ports/order-service.port';
import { CheckoutCommand } from './checkout.command';
import { CheckoutResult } from './checkout.command';


@Injectable()
export class CheckoutUseCases {
  constructor(
    @Inject(IBasketRepository.name)
    private readonly basketRepository: IBasketRepository,
    @Inject(PolicyServicePort.name)
    private readonly policyAdapter: PolicyServicePort,
    @Inject(OrderServicePort.name)
    private readonly orderAdapter: OrderServicePort,
  ) { }


  async checkout(command: CheckoutCommand): Promise<CheckoutResult> {
    const basket: BasketEntity =
      await this.basketRepository.getOrCreateForUser(command.userId);

    if (basket.isEmpty()) {
      throw new HttpException('Cannot checkout empty basket', HttpStatus.BAD_REQUEST);
    }

    const basketSnapshot = basket.createSnapshot();

    const policySnapshot: PolicySnapshot =
      await this.policyAdapter.createPolicySnapshot(basketSnapshot);

    const quote: CreateQuoteResult = await this.orderAdapter.createQuote(
      basketSnapshot,
      policySnapshot,
      command.businessPartnerId,
    );
    basket.clear();

    await this.basketRepository.save(basket);

    return {
      success: true,
      quote,
    };
  }


  async previewCheckout(userId: string): Promise<{
    valid: boolean;
    pricing?: {
      subtotal: number;
      totalDiscount: number;
      total: number;
      SupportedCurrency: string;
    };
    validationErrors?: Array<{ checkName: string; message: string }>;
  }> {
    const basket: BasketEntity =
      await this.basketRepository.getOrCreateForUser(userId);

    const basketSnapshot = basket.createSnapshot();

    const pricing: BasketPricingResult =
      await this.policyAdapter.calculateBasketPricing(basketSnapshot);

    return {
      valid: true,
      pricing: {
        subtotal: pricing.subtotal,
        totalDiscount: pricing.totalDiscount,
        total: pricing.total,
        SupportedCurrency: pricing.SupportedCurrency,
      },
    };
  }
}
