import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@common/domain/base/base.entity.js';
import { BasketEntity } from '@basket/domain/basket/basket.entity.js';

/**
 * Basket bundle - represents a bundle in a basket
 * Bundles are counted independently from individual items
 * Composite PK: basketId + bundleId
 */
@Entity('basket_bundles')
export class BasketBundleEntity extends BaseEntity {
  @PrimaryColumn({ name: 'basket_id' })
  basketId: string;

  @PrimaryColumn({ name: 'bundle_id' })
  bundleId: string;

  @Column({ type: 'integer', default: 1 })
  amount: number;

  @ManyToOne(() => BasketEntity, (basket) => basket.bundles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'basket_id' })
  basket: BasketEntity;

  /**
   * Validate that amount is positive
   */
  isValid(): boolean {
    return this.amount > 0;
  }

  /**
   * Increase the amount
   */
  increaseAmount(by: number = 1): void {
    if (by <= 0) {
      throw new Error('Increment must be positive');
    }
    this.amount += by;
  }

  /**
   * Decrease the amount
   */
  decreaseAmount(by: number = 1): void {
    if (by <= 0) {
      throw new Error('Decrement must be positive');
    }
    if (this.amount - by < 0) {
      throw new Error('Cannot decrease amount below 0');
    }
    this.amount -= by;
  }
}
