import { Injectable, Inject } from '@nestjs/common';
import {
  QuoteEntity,
  QuoteBasketSnapshot,
  QuotePolicySnapshot,
} from '../../domain/quote/quote.entity';
import { IQuoteRepository } from '../../domain/quote/quote.repository';

/**
 * Create quote DTO
 */
export interface CreateQuoteDto {
  userId: string;
  basketSnapshot: QuoteBasketSnapshot;
  policySnapshot: QuotePolicySnapshot;
  businessPartnerId?: string;
}

/**
 * Quote use cases
 */
@Injectable()
export class QuoteUseCases {
  constructor(
    @Inject('IQuoteRepository')
    private readonly quoteRepository: IQuoteRepository,
  ) {}

  /**
   * Create a new quote
   */
  async createQuote(dto: CreateQuoteDto): Promise<QuoteEntity> {
    const quote = QuoteEntity.create(
      dto.userId,
      dto.basketSnapshot,
      dto.policySnapshot,
      dto.businessPartnerId,
    );
    return this.quoteRepository.save(quote);
  }

  /**
   * Get quote by ID
   */
  async getQuote(quoteId: string): Promise<QuoteEntity | null> {
    return this.quoteRepository.findById(quoteId);
  }

  /**
   * Get quotes for user
   */
  async getQuotesForUser(userId: string): Promise<QuoteEntity[]> {
    return this.quoteRepository.findByUserId(userId);
  }

  /**
   * Delete quote
   */
  async deleteQuote(quoteId: string): Promise<void> {
    await this.quoteRepository.delete(quoteId);
  }
}
