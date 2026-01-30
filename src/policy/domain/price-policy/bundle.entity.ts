import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { TechnicalEntity } from '../../../_common/domain/base/base.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Money } from '../../../_common/domain/value-objects/money.value-object';
import { SupportedCurrency } from '../../../_common/domain/enums/currency.enum';
import { ProductAmount } from '../../../_common/domain/value-objects/product-amount.value-object';
import { BundleContentEntity } from './bundle-content.entity';

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

  @Column({ type: 'varchar', length: 3, default: 'EUR', name: 'SupportedCurrency' })
  _SupportedCurrency: SupportedCurrency;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  discountRate: number;

  @Column({ default: true })
  isActive: boolean;

  basePrice: Money;

  @AfterLoad()
  private afterLoad() {
    this.basePrice = Money.fromJSON({
      amount: this._basePrice,
      SupportedCurrency: this._SupportedCurrency,
    });
  }

  @BeforeInsert()
  @BeforeUpdate()
  private beforeSave() {
    this._basePrice = this.basePrice.amount;
    this._SupportedCurrency = this.basePrice.SupportedCurrency;
  }

  @OneToMany(() => BundleContentEntity, (content) => content.bundle, {
    cascade: true,
    eager: true,
  })
  contents: BundleContentEntity[];

  getDiscountedPrice(): Money {
    return this.basePrice.multiply(1 - this.discountRate);
  }

  getDiscountAmount(): Money {
    return this.basePrice.multiply(this.discountRate);
  }

  addItem(itemId: string, quantity: ProductAmount = ProductAmount.one()): void {
    if (quantity.isLessThanOrEqual(ProductAmount.zero())) {
      throw new HttpException(
        'Quantity must be positive',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = this.contents?.find((c) => c.itemId === itemId);
    if (existing) {
      existing.amount = existing.amount.add(quantity);
    } else {
      const content = new BundleContentEntity();
      content.bundleId = this.bundleId;
      content.itemId = itemId;
      content.amount = quantity;

      if (!this.contents) {
        this.contents = [];
      }
      this.contents.push(content);
    }
  }

  removeItem(itemId: string): void {
    if (!this.contents) return;
    const index = this.contents.findIndex((c) => c.itemId === itemId);
    if (index !== -1) {
      this.contents.splice(index, 1);
    }
  }

  updateItemQuantity(itemId: string, quantity: ProductAmount): void {
    if (quantity.isLessThanOrEqual(ProductAmount.zero())) {
      this.removeItem(itemId);
      return;
    }

    const content = this.contents?.find((c) => c.itemId === itemId);
    if (content) {
      content.amount = quantity;
    } else {
      throw new HttpException(
        `Item ${itemId} not found in bundle`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  setDiscountRate(rate: number): void {
    if (rate < 0 || rate >= 1) {
      throw new HttpException(
        'Discount rate must be between 0 and 1 (exclusive)',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.discountRate = rate;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  setNew(dto: {
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

  getItemIds(): string[] {
    return this.contents?.map((c) => c.itemId) ?? [];
  }

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
