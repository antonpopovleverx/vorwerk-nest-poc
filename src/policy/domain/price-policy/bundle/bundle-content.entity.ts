<<<<<<< Current (Your changes)
=======
import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { TechnicalEntity } from '../../../../_common/domain/base/base.entity';
import { BundleEntity } from 'src/policy/domain/price-policy/bundle/bundle.entity';
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
  private _quantity: number;

  @ManyToOne(() => BundleEntity, (bundle) => bundle.contents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bundle_id' })
  bundle: BundleEntity;

  // Value Object getter/setter
  get quantity(): ProductAmount {
    return ProductAmount.fromJSON(this._quantity);
  }

  set quantity(value: ProductAmount) {
    this._quantity = value.toJSON();
  }

  /**
   * Validate that quantity is positive
   */
  isValid(): boolean {
    return this.quantity.value > 0;
  }
}
>>>>>>> Incoming (Background Agent changes)
