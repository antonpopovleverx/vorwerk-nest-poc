import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Region } from '@common/domain/enums/region.enum.js';
import { ItemPriceEntity } from '@policy/domain/price-policy/item-price.entity.js';
import { ItemDiscountEntity } from '@policy/domain/price-policy/item-discount.entity.js';
import { IPricePolicyRepository } from '@policy/domain/price-policy/price-policy.repository.js';

/**
 * TypeORM implementation of price policy repository
 */
@Injectable()
export class PricePolicyRepositoryImpl implements IPricePolicyRepository {
  constructor(
    @InjectRepository(ItemPriceEntity)
    private readonly priceRepository: Repository<ItemPriceEntity>,
    @InjectRepository(ItemDiscountEntity)
    private readonly discountRepository: Repository<ItemDiscountEntity>,
  ) {}

  async getItemPrice(
    itemId: string,
    region: Region,
  ): Promise<ItemPriceEntity | null> {
    return this.priceRepository.findOne({
      where: { itemId, region },
    });
  }

  async getItemPrices(
    itemIds: string[],
    region: Region,
  ): Promise<ItemPriceEntity[]> {
    if (itemIds.length === 0) return [];
    return this.priceRepository.find({
      where: { itemId: In(itemIds), region },
    });
  }

  async saveItemPrice(price: ItemPriceEntity): Promise<ItemPriceEntity> {
    return this.priceRepository.save(price);
  }

  async getActiveItemDiscount(
    itemId: string,
    region: Region,
  ): Promise<ItemDiscountEntity | null> {
    const now = new Date();
    return this.discountRepository.findOne({
      where: {
        itemId,
        region,
        validFrom: LessThanOrEqual(now),
        validTo: MoreThanOrEqual(now),
      },
    });
  }

  async getActiveItemDiscounts(
    itemIds: string[],
    region: Region,
  ): Promise<ItemDiscountEntity[]> {
    if (itemIds.length === 0) return [];
    const now = new Date();
    return this.discountRepository.find({
      where: {
        itemId: In(itemIds),
        region,
        validFrom: LessThanOrEqual(now),
        validTo: MoreThanOrEqual(now),
      },
    });
  }

  async saveItemDiscount(
    discount: ItemDiscountEntity,
  ): Promise<ItemDiscountEntity> {
    return this.discountRepository.save(discount);
  }
}
