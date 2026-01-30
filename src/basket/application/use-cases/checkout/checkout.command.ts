import { CreateQuoteResult } from 'src/basket/application/ports/order-service.port';

export class CheckoutCommand {
  userId!: string;
  businessPartnerId?: string;
}
export class CheckoutResult {
  success!: boolean;
  quote?: CreateQuoteResult;
  error?: string;
  validationErrors?: Array<{ checkName: string; message: string; }>;
}

