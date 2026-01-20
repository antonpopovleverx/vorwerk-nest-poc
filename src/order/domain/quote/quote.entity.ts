import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '@common/domain/base/base.entity.js';
import { Currency } from '@common/domain/enums/currency.enum.js';

/**
 * Basket snapshot stored in quote
 */
export interface QuoteBasketSnapshot {
  basketId: string;
  userId: string;
  items: Array<{ itemId: string; amount: number }>;
  bundles: Array<{ bundleId: string; amount: number }>;
  snapshotAt: Date;
}

/**
 * Policy snapshot stored in quote
 */
export interface QuotePolicySnapshot {
  pricing: {
    items: Array<{
      itemId: string;
      amount: number;
      unitPrice: number;
      discount: number;
      totalPrice: number;
    }>;
    bundles: Array<{
      bundleId: string;
      amount: number;
      unitPrice: number;
      discount: number;
      totalPrice: number;
    }>;
    subtotal: number;
    totalDiscount: number;
    total: number;
    currency: Currency;
  };
  checksPerformed: string[];
  pricedAt: Date;
}

/**
 * Quote entity - captures basket and policy snapshots at checkout time
 */
@Entity('quotes')
export class QuoteEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'quote_id' })
  quoteId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'business_partner_id', type: 'varchar', nullable: true })
  businessPartnerId: string | null;

  @Column({ type: 'text', name: 'basket_snapshot' })
  private _basketSnapshot: string;

  @Column({ type: 'text', name: 'policy_snapshot' })
  private _policySnapshot: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 3 })
  currency: Currency;

  // Getters and setters for JSON columns

  get basketSnapshot(): QuoteBasketSnapshot {
    return JSON.parse(this._basketSnapshot);
  }

  set basketSnapshot(value: QuoteBasketSnapshot) {
    this._basketSnapshot = JSON.stringify(value);
  }

  get policySnapshot(): QuotePolicySnapshot {
    return JSON.parse(this._policySnapshot);
  }

  set policySnapshot(value: QuotePolicySnapshot) {
    this._policySnapshot = JSON.stringify(value);
  }

  // Domain methods

  /**
   * Get total price
   */
  getTotalPrice(): number {
    return Number(this.price);
  }

  /**
   * Get all item IDs from snapshot
   */
  getItemIds(): string[] {
    return this.basketSnapshot.items.map((i) => i.itemId);
  }

  /**
   * Get all bundle IDs from snapshot
   */
  getBundleIds(): string[] {
    return this.basketSnapshot.bundles.map((b) => b.bundleId);
  }

  /**
   * Factory method
   */
  static create(
    userId: string,
    basketSnapshot: QuoteBasketSnapshot,
    policySnapshot: QuotePolicySnapshot,
    businessPartnerId?: string,
  ): QuoteEntity {
    const quote = new QuoteEntity();
    quote.userId = userId;
    quote.businessPartnerId = businessPartnerId ?? null;
    quote.basketSnapshot = basketSnapshot;
    quote.policySnapshot = policySnapshot;
    quote.price = policySnapshot.pricing.total;
    quote.currency = policySnapshot.pricing.currency;
    return quote;
  }
}
