import { Injectable } from '@nestjs/common';
import {
  OrderServicePort,
  CreateQuoteResult,
} from '../../application/ports/order-service.port';
import { BasketSnapshot } from '../../domain/basket/basket.entity';
import { PolicySnapshot } from '../../application/ports/policy-service.port';

// Mock
@Injectable()
export class OrderServiceAdapter implements OrderServicePort {

  async createQuote(
    basketSnapshot: BasketSnapshot,
    policySnapshot: PolicySnapshot,
    businessPartnerId?: string,
  ): Promise<CreateQuoteResult> {

    return {
      quoteId: 'mock-quote-id',
      userId: 'mock-user-id',
      totalPrice: 123.45,
      SupportedCurrency: 'USD',
      createdAt: new Date('2023-01-01T00:00:00Z'),
    };
  }
}
