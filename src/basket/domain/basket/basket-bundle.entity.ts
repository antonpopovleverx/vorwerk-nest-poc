import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { TechnicalEntity } from '../../../_common/domain/base/base.entity';
import { BasketEntity } from './basket.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ProductAmount } from '../../../_common/domain/value-objects/product-amount.value-object';

@Entity('basket_bundles')
export class BasketBundleEntity extends TechnicalEntity {
  @PrimaryColumn({ name: 'basket_id' })
  basketId: string;

  @PrimaryColumn({ name: 'bundle_id' })
  bundleId: string;

  @Column({ type: 'integer', default: 1, name: 'amount' })
  _amount: number;

  @ManyToOne(() => BasketEntity, (basket) => basket.bundles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'basket_id' })
  basket: BasketEntity;

  amount: ProductAmount;

  @AfterLoad()
  private afterLoad() {
    this.amount = ProductAmount.fromJSON(this._amount);
  }

  @BeforeInsert()
  @BeforeUpdate()
  private beforeSave() {
    this._amount = this.amount.toJSON();
  }

  isValid(): boolean {
    return this.amount.value > 0;
  }

  increaseAmount(by: ProductAmount = ProductAmount.one()): void {
    if (by.isLessThanOrEqual(ProductAmount.zero())) {
      throw new HttpException(
        'Increment must be positive',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.amount = this.amount.add(by);
  }

  decreaseAmount(by: ProductAmount = ProductAmount.one()): void {
    if (by.isLessThanOrEqual(ProductAmount.zero())) {
      throw new HttpException(
        'Decrement must be positive',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.amount = this.amount.subtract(by);
  }
}
