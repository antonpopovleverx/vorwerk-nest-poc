import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TechnicalEntity } from '../../../_common/domain/base/base.entity';
import { BasketItemEntity } from './basket-item.entity';
import { BasketBundleEntity } from './basket-bundle.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ProductAmount } from '../../../_common/domain/value-objects/product-amount.value-object';

@Entity('baskets')
export class BasketEntity extends TechnicalEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'basket_id' })
  basketId: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToMany(() => BasketItemEntity, (item) => item.basket, {
    cascade: true,
    eager: true,
  })
  items: BasketItemEntity[];

  @OneToMany(() => BasketBundleEntity, (bundle) => bundle.basket, {
    cascade: true,
    eager: true,
  })
  bundles: BasketBundleEntity[];

  addItem(itemId: string, amount: ProductAmount = ProductAmount.one()): void {
    if (amount.isLessThanOrEqual(ProductAmount.zero())) {
      throw new HttpException(
        'Amount must be positive',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingItem = this.items?.find((i) => i.itemId === itemId);
    if (existingItem) {
      existingItem.increaseAmount(amount);
    } else {
      const newItem = new BasketItemEntity();
      newItem.basketId = this.basketId;
      newItem.itemId = itemId;
      newItem.amount = amount;

      if (!this.items) {
        this.items = [];
      }
      this.items.push(newItem);
    }
  }

  removeItem(itemId: string): void {
    if (!this.items) return;
    const index = this.items.findIndex((i) => i.itemId === itemId);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  updateItemAmount(itemId: string, amount: ProductAmount): void {
    if (amount.isLessThanOrEqual(ProductAmount.zero())) {
      this.removeItem(itemId);
      return;
    }

    const item = this.items?.find((i) => i.itemId === itemId);
    if (!item) {
      throw new HttpException(
        `Item ${itemId} not found in basket`,
        HttpStatus.NOT_FOUND,
      );
    }
    item.amount = amount;
  }

  addBundle(
    bundleId: string,
    amount: ProductAmount = ProductAmount.one(),
  ): void {
    if (amount.isLessThanOrEqual(ProductAmount.zero())) {
      throw new HttpException(
        'Amount must be positive',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingBundle = this.bundles?.find((b) => b.bundleId === bundleId);
    if (existingBundle) {
      existingBundle.increaseAmount(amount);
    } else {
      const newBundle = new BasketBundleEntity();
      newBundle.basketId = this.basketId;
      newBundle.bundleId = bundleId;
      newBundle.amount = amount;

      if (!this.bundles) {
        this.bundles = [];
      }
      this.bundles.push(newBundle);
    }
  }

  removeBundle(bundleId: string): void {
    if (!this.bundles) return;
    const index = this.bundles.findIndex((b) => b.bundleId === bundleId);
    if (index !== -1) {
      this.bundles.splice(index, 1);
    }
  }

  updateBundleAmount(bundleId: string, amount: ProductAmount): void {
    if (amount.isLessThanOrEqual(ProductAmount.zero())) {
      this.removeBundle(bundleId);
      return;
    }

    const bundle = this.bundles?.find((b) => b.bundleId === bundleId);
    if (!bundle) {
      throw new HttpException(
        `Bundle ${bundleId} not found in basket`,
        HttpStatus.NOT_FOUND,
      );
    }
    bundle.amount = amount;
  }

  clear(): void {
    this.items = [];
    this.bundles = [];
  }

  isEmpty(): boolean {
    return (
      (!this.items || this.items.length === 0) &&
      (!this.bundles || this.bundles.length === 0)
    );
  }

  getTotalItemCount(): number {
    return this.items?.reduce((sum, item) => sum + item.amount.value, 0) ?? 0;
  }

  getTotalBundleCount(): number {
    return (
      this.bundles?.reduce((sum, bundle) => sum + bundle.amount.value, 0) ?? 0
    );
  }

  createSnapshot(): BasketSnapshot {
    return {
      basketId: this.basketId,
      userId: this.userId,
      items:
        this.items?.map((i) => ({
          itemId: i.itemId,
          amount: i.amount.value,
        })) ?? [],
      bundles:
        this.bundles?.map((b) => ({
          bundleId: b.bundleId,
          amount: b.amount.value,
        })) ?? [],
      snapshotAt: new Date(),
    };
  }

  static createForUser(userId: string): BasketEntity {
    const basket = new BasketEntity();
    basket.userId = userId;
    basket.items = [];
    basket.bundles = [];
    return basket;
  }
}

export interface BasketSnapshot {
  basketId: string;
  userId: string;
  items: Array<{ itemId: string; amount: number }>;
  bundles: Array<{ bundleId: string; amount: number }>;
  snapshotAt: Date;
}
