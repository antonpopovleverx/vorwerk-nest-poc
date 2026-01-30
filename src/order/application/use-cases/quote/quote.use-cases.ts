import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import {
  QuoteEntity,
  QuoteBasketSnapshot,
  QuotePolicySnapshot,
} from '../../../domain/quote/quote.entity';
import { IQuoteRepository } from '../../../domain/quote/quote.repository';
import { isFound } from '../../../../_common/domain/specifications/specification.interface';

export class CreateQuoteDto {
  userId!: string;
  basketSnapshot!: QuoteBasketSnapshot;
  policySnapshot!: QuotePolicySnapshot;
  businessPartnerId?: string;
}

@Injectable()
export class QuoteUseCases {
  constructor(
    @Inject(IQuoteRepository.name)
    private readonly quoteRepository: IQuoteRepository,
  ) {}

  async createQuote(dto: CreateQuoteDto): Promise<QuoteEntity> {
    const quote: QuoteEntity = QuoteEntity.create(
      dto.userId,
      dto.basketSnapshot,
      dto.policySnapshot,
      dto.businessPartnerId,
    );

    return this.quoteRepository.save(quote);
  }

  async getQuote(quoteId: string): Promise<QuoteEntity> {
    const quote: QuoteEntity | null =
      await this.quoteRepository.findById(quoteId);
    if (!isFound(quote)) {
      throw new HttpException(
        `Quote ${quoteId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return quote;
  }

  async getQuotesForUser(userId: string): Promise<QuoteEntity[]> {
    return this.quoteRepository.findByUserId(userId);
  }

  async deleteQuote(quoteId: string): Promise<void> {
    await this.quoteRepository.delete(quoteId);
  }
}
