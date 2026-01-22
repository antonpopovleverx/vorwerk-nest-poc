import { Injectable, Inject } from '@nestjs/common';
import { IBasketRepository } from '../../domain/basket/basket.repository';
import {
  PolicyServicePort,
  PolicySnapshot,
} from '../ports/policy-service.port';
import {
  OrderServicePort,
  CreateQuoteResult,
} from '../ports/order-service.port';
import { BasketUseCases } from './basket.use-cases';
import { CheckoutCommand } from './checkout.command';

/**
 * Checkout result
 */
export class CheckoutResult {
  success!: boolean;
  quote?: CreateQuoteResult;
  error?: string;
  validationErrors?: Array<{ checkName: string; message: string }>;
}

/**
 * Checkout use cases - handles basket checkout flow
 */
@Injectable()
export class CheckoutUseCases {
  constructor(
    @Inject(IBasketRepository.name)
    private readonly basketRepository: IBasketRepository,
    @Inject(PolicyServicePort.name)
    private readonly policyAdapter: PolicyServicePort,
    @Inject(OrderServicePort.name)
    private readonly orderAdapter: OrderServicePort,
    private readonly basketUseCases: BasketUseCases,
  ) {}

  /**
   * Checkout basket - validates, creates quote, and optionally clears basket
   */
  async checkout(command: CheckoutCommand): Promise<CheckoutResult> {
    try {
      // 1. Validate basket
      const validation = await this.basketUseCases.validateBasket(
        command.userId,
      );
      if (!validation.valid) {
        return {
          success: false,
          validationErrors: validation.failedChecks,
          error: 'Basket validation failed',
        };
      }

      // 2. Get basket snapshot
      const basketSnapshot = await this.basketUseCases.getBasketSnapshot(
        command.userId,
      );

      if (
        basketSnapshot.items.length === 0 &&
        basketSnapshot.bundles.length === 0
      ) {
        return {
          success: false,
          error: 'Cannot checkout empty basket',
        };
      }

      // 3. Create policy snapshot
      const policySnapshot: PolicySnapshot =
        await this.policyAdapter.createPolicySnapshot(basketSnapshot);

      // 4. Create quote via order service
      const quote: CreateQuoteResult = await this.orderAdapter.createQuote(
        basketSnapshot,
        policySnapshot,
        command.businessPartnerId,
      );

      // 5. Clear basket after successful checkout
      await this.basketUseCases.clearBasket(command.userId);

      return {
        success: true,
        quote,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Checkout failed',
      };
    }
  }

  /**
   * Preview checkout - validates and returns pricing without creating quote
   */
  async previewCheckout(userId: string): Promise<{
    valid: boolean;
    pricing?: {
      subtotal: number;
      totalDiscount: number;
      total: number;
      currency: string;
    };
    validationErrors?: Array<{ checkName: string; message: string }>;
  }> {
    const validation = await this.basketUseCases.validateBasket(userId);

    if (!validation.valid) {
      return {
        valid: false,
        validationErrors: validation.failedChecks,
      };
    }

    const pricing = await this.basketUseCases.getBasketPricing(userId);

    return {
      valid: true,
      pricing: {
        subtotal: pricing.subtotal,
        totalDiscount: pricing.totalDiscount,
        total: pricing.total,
        currency: pricing.currency,
      },
    };
  }
}
