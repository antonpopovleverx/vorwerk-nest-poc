import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, AfterLoad, BeforeInsert, BeforeUpdate } from 'typeorm';
import { TechnicalEntity } from '../../../../_common/domain/base/base.entity';
import { BundleEntity } from '../bundle.entity';
import { ProductAmount } from '../../../../_common/domain/value-objects/product-amount.value-object';

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

  @Column({ type: 'integer', default: 1, name: 'quantity' })
  _quantity: number;

  @ManyToOne(() => BundleEntity, (bundle) => bundle.contents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bundle_id' })
  bundle: BundleEntity;

  // Value Object field
  quantity: ProductAmount;

  @AfterLoad()
  private afterLoad() {
    this.quantity = ProductAmount.fromJSON(this._quantity);
  }

  @BeforeInsert()
  @BeforeUpdate()
  private beforeSave() {
    this._quantity = this.quantity.toJSON();
  }

  /**
   * Validate that quantity is positive
   */
  isValid(): boolean {
    return this.quantity.value > 0;
  }
}
