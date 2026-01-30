import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { TechnicalEntity } from '../../../_common/domain/base/base.entity';
import { SupportedCurrency } from '../../../_common/domain/enums/currency.enum';

export interface QuoteBasketSnapshot {
  basketId: string;
  userId: string;
  items: Array<{ itemId: string; amount: number }>;
  bundles: Array<{ bundleId: string; amount: number }>;
  snapshotAt: Date;
}

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
    SupportedCurrency: SupportedCurrency;
  };
  checksPerformed: string[];
  pricedAt: Date;
}

@Entity('quotes')
export class QuoteEntity extends TechnicalEntity {
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
  SupportedCurrency: SupportedCurrency;

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

  getTotalPrice(): number {
    return Number(this.price);
  }

  getItemIds(): string[] {
    return this.basketSnapshot.items.map((i) => i.itemId);
  }

  getBundleIds(): string[] {
    return this.basketSnapshot.bundles.map((b) => b.bundleId);
  }

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
    quote.SupportedCurrency = policySnapshot.pricing.SupportedCurrency;
    return quote;
  }
}
