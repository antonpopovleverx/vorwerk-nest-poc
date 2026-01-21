import { Entity, Column, PrimaryColumn } from 'typeorm';
import { TechnicalEntity } from '../../../_common/domain/base/base.entity';
import { Region } from '../../../_common/domain/enums/region.enum';
import { Currency } from '../../../_common/domain/enums/currency.enum';

/**
 * Item price entity
 * Composite PK: itemId + region
 * Note: Item itself is in a different microservice
 */
@Entity('item_prices')
export class ItemPriceEntity extends TechnicalEntity {
  @PrimaryColumn({ name: 'item_id' })
  itemId: string;

  @PrimaryColumn({ type: 'varchar', length: 10 })
  region: Region;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 3 })
  currency: Currency;

  /**
   * Get the price as a number
   */
  getPrice(): number {
    return Number(this.price);
  }

  /**
   * Factory method
   */
  static create(
    itemId: string,
    region: Region,
    price: number,
    currency: Currency,
  ): ItemPriceEntity {
    const entity = new ItemPriceEntity();
    entity.itemId = itemId;
    entity.region = region;
    entity.price = price;
    entity.currency = currency;
    return entity;
  }
}
