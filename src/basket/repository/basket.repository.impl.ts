import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IBasketRepository } from '../domain/basket/basket.repository';
import { BasketEntity } from '../domain/basket/basket.entity';


/**
 * TypeORM implementation of basket repository
 */
@Injectable()
export class BasketRepositoryImplementation implements IBasketRepository {
  constructor(
    @InjectRepository(BasketEntity)
    private readonly repository: Repository<BasketEntity>,
  ) {}

  async findById(basketId: string): Promise<BasketEntity | null> {
    return this.repository.findOne({
      where: { basketId },
      relations: ['items', 'bundles'],
    });
  }

  

  async findByUserId(userId: string): Promise<BasketEntity | null> {

    return this.repository.findOne({
      where: { userId },
      relations: ['items', 'bundles'],
      
    });
  }

  async save(basket: BasketEntity): Promise<BasketEntity> {
    return this.repository.save(basket);
  }

  async delete(basketId: string): Promise<void> {
    await this.repository.delete({ basketId });
  }

  async getOrCreateForUser(userId: string): Promise<BasketEntity> {
    let basket = await this.findByUserId(userId);

    if (!basket) {
      basket = BasketEntity.createForUser(userId);
      basket = await this.save(basket);
    }

    return basket;
  }
}
