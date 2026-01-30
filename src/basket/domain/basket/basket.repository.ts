import { BasketEntity } from './basket.entity';

export abstract class IBasketRepository {
  abstract findById(basketId: string): Promise<BasketEntity | null>;
  abstract findByUserId(userId: string): Promise<BasketEntity | null>;
  abstract save(basket: BasketEntity): Promise<BasketEntity>;
  abstract delete(basketId: string): Promise<void>;
  abstract getOrCreateForUser(userId: string): Promise<BasketEntity>;
}
