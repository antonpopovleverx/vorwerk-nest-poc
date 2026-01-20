import { Injectable } from '@nestjs/common';
import {
  IOrderServicePort,
  CreateQuoteResult,
} from '../../../basket/application/ports/order-service.port.js';
import { BasketSnapshot } from '../../../basket/domain/basket/basket.entity.js';
import { PolicySnapshot } from '../../../basket/application/ports/policy-service.port.js';
import { QuoteUseCases } from '../../application/use-cases/quote.use-cases.js';

/**
 * Adapter implementing IOrderServicePort for basket subdomain
 * This bridges basket subdomain to order subdomain
 */
@Injectable()
export class OrderServiceAdapter implements IOrderServicePort {
  constructor(private readonly quoteUseCases: QuoteUseCases) {}

  async createQuote(
    basketSnapshot: BasketSnapshot,
    policySnapshot: PolicySnapshot,
    businessPartnerId?: string,
  ): Promise<CreateQuoteResult> {
    const quote = await this.quoteUseCases.createQuote({
      userId: basketSnapshot.userId,
      basketSnapshot: {
        basketId: basketSnapshot.basketId,
        userId: basketSnapshot.userId,
        items: basketSnapshot.items,
        bundles: basketSnapshot.bundles,
        snapshotAt: basketSnapshot.snapshotAt,
      },
      policySnapshot: {
        pricing: policySnapshot.pricing,
        checksPerformed: policySnapshot.checksPerformed,
        pricedAt: policySnapshot.pricedAt,
      },
      businessPartnerId,
    });

    return {
      quoteId: quote.quoteId,
      userId: quote.userId,
      totalPrice: quote.getTotalPrice(),
      currency: quote.currency,
      createdAt: quote.createdAt,
    };
  }
}
