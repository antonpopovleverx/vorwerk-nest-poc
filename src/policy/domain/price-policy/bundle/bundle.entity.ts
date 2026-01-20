import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/domain/base/base.entity.js';
import { BundleContentEntity } from '@policy/domain/price-policy/bundle/bundle-content.entity.js';

/**
 * Bundle aggregate root
 * Represents a bundle of items with a discount
 */
@Entity('bundles')
export class BundleEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'bundle_id' })
  bundleId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  basePrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  discountRate: number; // 0 < rate < 1

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => BundleContentEntity, (content) => content.bundle, {
    cascade: true,
    eager: true,
  })
  contents: BundleContentEntity[];

  // Domain methods

  /**
   * Calculate the discounted price
   */
  getDiscountedPrice(): number {
    return Math.round(this.basePrice * (1 - this.discountRate) * 100) / 100;
  }

  /**
   * Calculate the discount amount
   */
  getDiscountAmount(): number {
    return Math.round(this.basePrice * this.discountRate * 100) / 100;
  }

  /**
   * Add an item to the bundle
   */
  addItem(itemId: string, quantity: number = 1): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    const existing = this.contents?.find((c) => c.itemId === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      const content = new BundleContentEntity();
      content.bundleId = this.bundleId;
      content.itemId = itemId;
      content.quantity = quantity;

      if (!this.contents) {
        this.contents = [];
      }
      this.contents.push(content);
    }
  }

  /**
   * Remove an item from the bundle
   */
  removeItem(itemId: string): void {
    if (!this.contents) return;
    const index = this.contents.findIndex((c) => c.itemId === itemId);
    if (index !== -1) {
      this.contents.splice(index, 1);
    }
  }

  /**
   * Update item quantity in bundle
   */
  updateItemQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    const content = this.contents?.find((c) => c.itemId === itemId);
    if (content) {
      content.quantity = quantity;
    } else {
      throw new Error(`Item ${itemId} not found in bundle`);
    }
  }

  /**
   * Set discount rate (must be between 0 and 1)
   */
  setDiscountRate(rate: number): void {
    if (rate < 0 || rate >= 1) {
      throw new Error('Discount rate must be between 0 and 1 (exclusive)');
    }
    this.discountRate = rate;
  }

  /**
   * Activate the bundle
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Deactivate the bundle
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Get all item IDs in the bundle
   */
  getItemIds(): string[] {
    return this.contents?.map((c) => c.itemId) ?? [];
  }

  /**
   * Factory method to create a new bundle
   */
  static create(
    name: string,
    description: string,
    basePrice: number,
    discountRate: number,
  ): BundleEntity {
    const bundle = new BundleEntity();
    bundle.name = name;
    bundle.description = description;
    bundle.basePrice = basePrice;
    bundle.setDiscountRate(discountRate);
    bundle.isActive = true;
    bundle.contents = [];
    return bundle;
  }
}
