import { Entity, Column, PrimaryColumn } from 'typeorm';
import { TechnicalEntity } from '../../../_common/domain/base/base.entity';
import { SupportedRegion } from '../../../_common/domain/enums/region.enum';
import { SupportedCurrency } from '../../../_common/domain/enums/currency.enum';

@Entity('item_prices')
export class ItemPriceEntity extends TechnicalEntity {
  @PrimaryColumn({ name: 'item_id' })
  itemId: string;

  @PrimaryColumn({ type: 'varchar', length: 10 })
  SupportedRegion: SupportedRegion;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 3 })
  SupportedCurrency: SupportedCurrency;

  getPrice(): number {
    return Number(this.price);
  }

  static create(
    itemId: string,
    SupportedRegion: SupportedRegion,
    price: number,
    SupportedCurrency: SupportedCurrency,
  ): ItemPriceEntity {
    const entity = new ItemPriceEntity();
    entity.itemId = itemId;
    entity.SupportedRegion = SupportedRegion;
    entity.price = price;
    entity.SupportedCurrency = SupportedCurrency;
    return entity;
  }
}
