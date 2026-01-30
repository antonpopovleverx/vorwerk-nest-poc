import { Entity, Column, PrimaryColumn } from 'typeorm';
import { TechnicalEntity } from '../../../_common/domain/base/base.entity';
import { SupportedRegion } from '../../../_common/domain/enums/region.enum';
import { HttpException, HttpStatus } from '@nestjs/common';

@Entity('item_discounts')
export class ItemDiscountEntity extends TechnicalEntity {
  @PrimaryColumn({ name: 'item_id' })
  itemId: string;

  @Column({ type: 'varchar', length: 10 })
  SupportedRegion: SupportedRegion;

  @PrimaryColumn({ name: 'valid_from', type: 'datetime' })
  validFrom: Date;

  @PrimaryColumn({ name: 'valid_to', type: 'datetime' })
  validTo: Date;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  amount: number;

  isCurrentlyValid(): boolean {
    const now = new Date();
    return now >= this.validFrom && now <= this.validTo;
  }

  getDiscountRate(): number {
    return Number(this.amount);
  }

  static create(
    itemId: string,
    SupportedRegion: SupportedRegion,
    validFrom: Date,
    validTo: Date,
    amount: number,
  ): ItemDiscountEntity {
    if (amount <= 0 || amount >= 1) {
      throw new HttpException(
        'Discount amount must be between 0 and 1 (exclusive)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (validFrom >= validTo) {
      throw new HttpException(
        'validFrom must be before validTo',
        HttpStatus.BAD_REQUEST,
      );
    }

    const entity = new ItemDiscountEntity();
    entity.itemId = itemId;
    entity.SupportedRegion = SupportedRegion;
    entity.validFrom = validFrom;
    entity.validTo = validTo;
    entity.amount = amount;
    return entity;
  }
}
