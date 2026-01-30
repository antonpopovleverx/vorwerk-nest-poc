import { SupportedRegion } from '../../../_common/domain/enums/region.enum';
import { ItemPriceEntity } from './item-price.entity';
import { ItemDiscountEntity } from './item-discount.entity';

export abstract class IPricePolicyRepository {
  abstract getItemPrice(
    itemId: string,
    SupportedRegion: SupportedRegion,
  ): Promise<ItemPriceEntity | null>;

  abstract getItemPrices(
    itemIds: string[],
    SupportedRegion: SupportedRegion,
  ): Promise<ItemPriceEntity[]>;

  abstract saveItemPrice(price: ItemPriceEntity): Promise<ItemPriceEntity>;

  abstract getActiveItemDiscount(
    itemId: string,
    SupportedRegion: SupportedRegion,
  ): Promise<ItemDiscountEntity | null>;

  abstract getActiveItemDiscounts(
    itemIds: string[],
    SupportedRegion: SupportedRegion,
  ): Promise<ItemDiscountEntity[]>;

  abstract saveItemDiscount(
    discount: ItemDiscountEntity,
  ): Promise<ItemDiscountEntity>;
}
