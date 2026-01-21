import { PolicySnapshot } from 'src/basket/application/ports/policy-service.port';
import { BasketSnapshot } from '../../domain/basket/basket.entity';

/**
 * Quote creation result
 */
export class CreateQuoteResult {
  quoteId!: string;
  userId!: string;
  totalPrice!: number;
  currency!: string;
  createdAt!: Date;
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
