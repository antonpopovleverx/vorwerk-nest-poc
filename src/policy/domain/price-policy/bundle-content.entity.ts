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
import { BundleEntity } from './bundle.entity';
import { ProductAmount } from '../../../_common/domain/value-objects/product-amount.value-object';

/**
 * Bundle content - represents an item within a bundle
 * Composite PK: bundleId + itemId
 */
@Entity('bundle_contents')
export class BundleContentEntity extends TechnicalEntity {
  @PrimaryColumn({ name: 'bundle_id' })
  bundleId: string;

  @PrimaryColumn({ name: 'item_id' })
  itemId: string;

  @Column({ type: 'integer', default: 1, name: 'amount' })
  _amount: number;

  @ManyToOne(() => BundleEntity, (bundle) => bundle.contents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bundle_id' })
  bundle: BundleEntity;

  // Value Object field
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

  /**
   * Validate that amount is positive
   */
  isValid(): boolean {
    return this.amount.value > 0;
  }
}
