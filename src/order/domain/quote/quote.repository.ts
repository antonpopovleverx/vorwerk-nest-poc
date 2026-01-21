import { QuoteEntity } from './quote.entity';

/**
 * Quote repository port
 */
export abstract class IQuoteRepository {
  abstract findById(quoteId: string): Promise<QuoteEntity | null>;
  abstract findByUserId(userId: string): Promise<QuoteEntity[]>;
  abstract save(quote: QuoteEntity): Promise<QuoteEntity>;
  abstract delete(quoteId: string): Promise<void>;
}
