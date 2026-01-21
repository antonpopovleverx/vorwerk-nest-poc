import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { TechnicalEntity } from '../../../_common/domain/base/base.entity';
import { BasketEntity } from './basket.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Basket bundle - represents a bundle in a basket
 * Bundles are counted independently from individual items
 * Composite PK: basketId + bundleId
 */
@Entity('basket_bundles')
export class BasketBundleEntity extends TechnicalEntity {
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
      throw new HttpException('Increment must be positive', HttpStatus.BAD_REQUEST);
    }
    this.amount += by;
  }

  /**
   * Decrease the amount
   */
  decreaseAmount(by: number = 1): void {
    if (by <= 0) {
      throw new HttpException('Decrement must be positive', HttpStatus.BAD_REQUEST);
    }
    if (this.amount - by < 0) {
      throw new HttpException('Cannot decrease amount below 0', HttpStatus.BAD_REQUEST);
    }
    this.amount -= by;
  }
}
