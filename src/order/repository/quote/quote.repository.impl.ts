import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IQuoteRepository } from '../../domain/quote/quote.repository';
import { QuoteEntity } from '../../domain/quote/quote.entity';
import { Repository } from 'typeorm';

/**
 * TypeORM implementation of quote repository
 */
@Injectable()
export class QuoteRepositoryImplementation implements IQuoteRepository {
  constructor(
    @InjectRepository(QuoteEntity)
    private readonly repository: Repository<QuoteEntity>,
  ) {}

  async findById(quoteId: string): Promise<QuoteEntity | null> {
    return this.repository.findOne({
      where: { quoteId },
    });
  }

  async findByUserId(userId: string): Promise<QuoteEntity[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async save(quote: QuoteEntity): Promise<QuoteEntity> {
    return this.repository.save(quote);
  }

  async delete(quoteId: string): Promise<void> {
    await this.repository.delete({ quoteId });
  }
}
