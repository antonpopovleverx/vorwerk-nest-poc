import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/domain/base/base.entity.js';
import { BasketItemEntity } from '@basket/domain/basket/basket-item.entity.js';
import { BasketBundleEntity } from '@basket/domain/basket/basket-bundle.entity.js';

/**
 * Basket aggregate root
 * Identified by userId (one user has one basket)
 */
@Entity('baskets')
export class BasketEntity extends BaseEntity {
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

  // Domain methods

  /**
   * Add an item to the basket or increase quantity if already present
   */
  addItem(itemId: string, amount: number = 1): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const existingItem = this.items?.find((i) => i.itemId === itemId);
    if (existingItem) {
      existingItem.amount += amount;
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

  /**
   * Remove an item from the basket
   */
  removeItem(itemId: string): void {
    if (!this.items) return;
    const index = this.items.findIndex((i) => i.itemId === itemId);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  /**
   * Update item quantity
   */
  updateItemAmount(itemId: string, amount: number): void {
    if (amount <= 0) {
      this.removeItem(itemId);
      return;
    }

    const item = this.items?.find((i) => i.itemId === itemId);
    if (item) {
      item.amount = amount;
    } else {
      throw new Error(`Item ${itemId} not found in basket`);
    }
  }

  /**
   * Add a bundle to the basket
   */
  addBundle(bundleId: string, amount: number = 1): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const existingBundle = this.bundles?.find((b) => b.bundleId === bundleId);
    if (existingBundle) {
      existingBundle.amount += amount;
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

  /**
   * Remove a bundle from the basket
   */
  removeBundle(bundleId: string): void {
    if (!this.bundles) return;
    const index = this.bundles.findIndex((b) => b.bundleId === bundleId);
    if (index !== -1) {
      this.bundles.splice(index, 1);
    }
  }

  /**
   * Update bundle quantity
   */
  updateBundleAmount(bundleId: string, amount: number): void {
    if (amount <= 0) {
      this.removeBundle(bundleId);
      return;
    }

    const bundle = this.bundles?.find((b) => b.bundleId === bundleId);
    if (bundle) {
      bundle.amount = amount;
    } else {
      throw new Error(`Bundle ${bundleId} not found in basket`);
    }
  }

  /**
   * Clear all items and bundles from basket
   */
  clear(): void {
    this.items = [];
    this.bundles = [];
  }

  /**
   * Check if basket is empty
   */
  isEmpty(): boolean {
    return (
      (!this.items || this.items.length === 0) &&
      (!this.bundles || this.bundles.length === 0)
    );
  }

  /**
   * Get total number of individual items (excluding bundle contents)
   */
  getTotalItemCount(): number {
    return this.items?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
  }

  /**
   * Get total number of bundles
   */
  getTotalBundleCount(): number {
    return this.bundles?.reduce((sum, bundle) => sum + bundle.amount, 0) ?? 0;
  }

  /**
   * Create a snapshot of basket contents for quote
   */
  createSnapshot(): BasketSnapshot {
    return {
      basketId: this.basketId,
      userId: this.userId,
      items:
        this.items?.map((i) => ({
          itemId: i.itemId,
          amount: i.amount,
        })) ?? [],
      bundles:
        this.bundles?.map((b) => ({
          bundleId: b.bundleId,
          amount: b.amount,
        })) ?? [],
      snapshotAt: new Date(),
    };
  }

  /**
   * Factory method to create a new basket for a user
   */
  static createForUser(userId: string): BasketEntity {
    const basket = new BasketEntity();
    basket.userId = userId;
    basket.items = [];
    basket.bundles = [];
    return basket;
  }
}

/**
 * Basket snapshot for quotes/orders
 */
export interface BasketSnapshot {
  basketId: string;
  userId: string;
  items: Array<{ itemId: string; amount: number }>;
  bundles: Array<{ bundleId: string; amount: number }>;
  snapshotAt: Date;
}
