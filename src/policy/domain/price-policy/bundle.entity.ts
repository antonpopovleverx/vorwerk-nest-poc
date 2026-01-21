import { Entity, PrimaryGeneratedColumn, Column, OneToMany, AfterLoad, BeforeInsert, BeforeUpdate } from 'typeorm';
import { TechnicalEntity } from '../../../_common/domain/base/base.entity';
import { BundleContentEntity } from './bundle/bundle-content.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Money } from '../../../_common/domain/value-objects/money.value-object';
import { Currency } from '../../../_common/domain/enums/currency.enum';
import { ProductAmount } from '../../../_common/domain/value-objects/product-amount.value-object';

/**
 * Bundle aggregate root
 * Represents a bundle of items with a discount
 */
@Entity('bundles')
export class BundleEntity extends TechnicalEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'bundle_id' })
  bundleId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    name: 'base_price',
  })
  _basePrice: number;

  @Column({ type: 'varchar', length: 3, default: 'EUR', name: 'currency' })
  _currency: Currency;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  discountRate: number; // 0 < rate < 1

  @Column({ default: true })
  isActive: boolean;

  // Value Object field
  basePrice: Money;

  @AfterLoad()
  private afterLoad() {
    this.basePrice = Money.fromJSON({
      amount: this._basePrice,
      currency: this._currency,
    });
  }

  @BeforeInsert()
  @BeforeUpdate()
  private beforeSave() {
    this._basePrice = this.basePrice.amount;
    this._currency = this.basePrice.currency;
  }

  @OneToMany(() => BundleContentEntity, (content) => content.bundle, {
    cascade: true,
    eager: true,
  })
  contents: BundleContentEntity[];

  // Domain methods

  /**
   * Calculate the discounted price
   */
  getDiscountedPrice(): Money {
    return this.basePrice.multiply(1 - this.discountRate);
  }

  /**
   * Calculate the discount amount
   */
  getDiscountAmount(): Money {
    return this.basePrice.multiply(this.discountRate);
  }

  /**
   * Add an item to the bundle
   */
  addItem(itemId: string, quantity: ProductAmount = ProductAmount.one()): void {
    if (quantity.isLessThanOrEqual(ProductAmount.zero())) {
      throw new HttpException(
        'Quantity must be positive',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = this.contents?.find((c) => c.itemId === itemId);
    if (existing) {
      existing.quantity = existing.quantity.add(quantity);
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
  updateItemQuantity(itemId: string, quantity: ProductAmount): void {
    if (quantity.isLessThanOrEqual(ProductAmount.zero())) {
      this.removeItem(itemId);
      return;
    }

    const content = this.contents?.find((c) => c.itemId === itemId);
    if (content) {
      content.quantity = quantity;
    } else {
      throw new HttpException(
        `Item ${itemId} not found in bundle`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Set discount rate (must be between 0 and 1)
   */
  setDiscountRate(rate: number): void {
    if (rate < 0 || rate >= 1) {
      throw new HttpException(
        'Discount rate must be between 0 and 1 (exclusive)',
        HttpStatus.BAD_REQUEST,
      );
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
   * Update bundle fields from DTO
   */
  updateFromDto(dto: {
    name?: string;
    description?: string;
    basePrice?: Money;
    discountRate?: number;
    isActive?: boolean;
  }): void {
    if (dto.name !== undefined) this.name = dto.name;
    if (dto.description !== undefined) this.description = dto.description;
    if (dto.basePrice !== undefined) this.basePrice = dto.basePrice;
    if (dto.discountRate !== undefined) this.setDiscountRate(dto.discountRate);
    if (dto.isActive !== undefined) {
      if (dto.isActive) {
        this.activate();
      } else {
        this.deactivate();
      }
    }
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
    basePrice: Money,
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
