import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ItemPriceEntity } from '../domain/price-policy/item-price.entity';
import { ItemDiscountEntity } from '../domain/price-policy/item-discount.entity';
import { IPricePolicyRepository } from '../domain/price-policy/price-policy.repository';
import { SupportedRegion } from 'src/_common/domain/enums/region.enum';

@Injectable()
export class PricePolicyRepositoryImplementation implements IPricePolicyRepository {
  constructor(
    @InjectRepository(ItemPriceEntity)
    private readonly priceRepository: Repository<ItemPriceEntity>,
    @InjectRepository(ItemDiscountEntity)
    private readonly discountRepository: Repository<ItemDiscountEntity>,
  ) {}

  async getItemPrice(
    itemId: string,
    SupportedRegion: SupportedRegion,
  ): Promise<ItemPriceEntity | null> {
    return this.priceRepository.findOne({
      where: { itemId, SupportedRegion },
    });
  }

  async getItemPrices(
    itemIds: string[],
    SupportedRegion: SupportedRegion,
  ): Promise<ItemPriceEntity[]> {
    if (itemIds.length === 0) return [];
    return this.priceRepository.find({
      where: { itemId: In(itemIds), SupportedRegion },
    });
  }

  async saveItemPrice(price: ItemPriceEntity): Promise<ItemPriceEntity> {
    return this.priceRepository.save(price);
  }

  async getActiveItemDiscount(
    itemId: string,
    SupportedRegion: SupportedRegion,
  ): Promise<ItemDiscountEntity | null> {
    const now = new Date();
    return this.discountRepository.findOne({
      where: {
        itemId,
        SupportedRegion,
        validFrom: LessThanOrEqual(now),
        validTo: MoreThanOrEqual(now),
      },
    });
  }

  async getActiveItemDiscounts(
    itemIds: string[],
    SupportedRegion: SupportedRegion,
  ): Promise<ItemDiscountEntity[]> {
    if (itemIds.length === 0) return [];
    const now = new Date();
    return this.discountRepository.find({
      where: {
        itemId: In(itemIds),
        SupportedRegion,
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
