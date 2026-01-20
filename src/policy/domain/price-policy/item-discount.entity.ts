import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@common/domain/base/base.entity.js';
import { Region } from '@common/domain/enums/region.enum.js';

/**
 * Item discount entity
 * Composite PK: itemId + validFrom + validTo
 */
@Entity('item_discounts')
export class ItemDiscountEntity extends BaseEntity {
  @PrimaryColumn({ name: 'item_id' })
  itemId: string;

  @Column({ type: 'varchar', length: 10 })
  region: Region;

  @PrimaryColumn({ name: 'valid_from', type: 'datetime' })
  validFrom: Date;

  @PrimaryColumn({ name: 'valid_to', type: 'datetime' })
  validTo: Date;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  amount: number; // 0 < amount < 1

  /**
   * Check if discount is currently valid
   */
  isCurrentlyValid(): boolean {
    const now = new Date();
    return now >= this.validFrom && now <= this.validTo;
  }

  /**
   * Get the discount rate as a number
   */
  getDiscountRate(): number {
    return Number(this.amount);
  }

  /**
   * Factory method
   */
  static create(
    itemId: string,
    region: Region,
    validFrom: Date,
    validTo: Date,
    amount: number,
  ): ItemDiscountEntity {
    if (amount <= 0 || amount >= 1) {
      throw new Error('Discount amount must be between 0 and 1 (exclusive)');
    }
    if (validFrom >= validTo) {
      throw new Error('validFrom must be before validTo');
    }

    const entity = new ItemDiscountEntity();
    entity.itemId = itemId;
    entity.region = region;
    entity.validFrom = validFrom;
    entity.validTo = validTo;
    entity.amount = amount;
    return entity;
  }
}
