import { BasketSnapshot } from '@basket/domain/basket/basket.entity.js';
import { PolicySnapshot } from '@basket/application/ports/policy-service.port.js';

/**
 * Quote creation result
 */
export interface CreateQuoteResult {
  quoteId: string;
  userId: string;
  totalPrice: number;
  currency: string;
  createdAt: Date;
}

/**
 * Port for order service (basket subdomain -> order subdomain)
 */
export abstract class IOrderServicePort {
  /**
   * Create a quote from basket and policy snapshots
   */
  abstract createQuote(
    basketSnapshot: BasketSnapshot,
    policySnapshot: PolicySnapshot,
    businessPartnerId?: string,
  ): Promise<CreateQuoteResult>;
}
