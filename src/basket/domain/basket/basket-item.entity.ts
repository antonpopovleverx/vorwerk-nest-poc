import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '../../../_common/domain/base/base.entity.js';
import { BasketEntity } from './basket.entity.js';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Basket item - represents an individual item in a basket
 * Composite PK: basketId + itemId
 */
@Entity('basket_items')
export class BasketItemEntity extends BaseEntity {
  @PrimaryColumn({ name: 'basket_id' })
  basketId: string;

  @PrimaryColumn({ name: 'item_id' })
  itemId: string;

  @Column({ type: 'integer', default: 1 })
  amount: number;

  @ManyToOne(() => BasketEntity, (basket) => basket.items, {
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
