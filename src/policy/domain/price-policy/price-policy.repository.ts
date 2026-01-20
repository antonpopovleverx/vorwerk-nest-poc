import { Region } from '../../../_common/domain/enums/region.enum.js';
import { ItemPriceEntity } from './item-price.entity.js';
import { ItemDiscountEntity } from './item-discount.entity.js';

/**
 * Price policy repository port
 */
export abstract class IPricePolicyRepository {
  // Item prices
  abstract getItemPrice(
    itemId: string,
    region: Region,
  ): Promise<ItemPriceEntity | null>;

  abstract getItemPrices(
    itemIds: string[],
    region: Region,
  ): Promise<ItemPriceEntity[]>;

  abstract saveItemPrice(price: ItemPriceEntity): Promise<ItemPriceEntity>;

  // Item discounts
  abstract getActiveItemDiscount(
    itemId: string,
    region: Region,
  ): Promise<ItemDiscountEntity | null>;

  abstract getActiveItemDiscounts(
    itemIds: string[],
    region: Region,
  ): Promise<ItemDiscountEntity[]>;

  abstract saveItemDiscount(
    discount: ItemDiscountEntity,
  ): Promise<ItemDiscountEntity>;
}
