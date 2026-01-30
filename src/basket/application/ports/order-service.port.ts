import { PolicySnapshot } from 'src/basket/application/ports/policy-service.port';
import { BasketSnapshot } from '../../domain/basket/basket.entity';

export class CreateQuoteResult {
  quoteId!: string;
  userId!: string;
  totalPrice!: number;
  SupportedCurrency!: string;
  createdAt!: Date;
}

export abstract class OrderServicePort {
  abstract createQuote(
    basketSnapshot: BasketSnapshot,
    policySnapshot: PolicySnapshot,
    businessPartnerId?: string,
  ): Promise<CreateQuoteResult>;
}
