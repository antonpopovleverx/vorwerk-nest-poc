import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@common/domain/base/base.entity.js';
import { BundleEntity } from '@policy/domain/price-policy/bundle/bundle.entity.js';

/**
 * Bundle content - represents an item within a bundle
 * Composite PK: bundleId + itemId
 */
@Entity('bundle_contents')
export class BundleContentEntity extends BaseEntity {
  @PrimaryColumn({ name: 'bundle_id' })
  bundleId: string;

  @PrimaryColumn({ name: 'item_id' })
  itemId: string;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @ManyToOne(() => BundleEntity, (bundle) => bundle.contents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bundle_id' })
  bundle: BundleEntity;

  /**
   * Validate that quantity is positive
   */
  isValid(): boolean {
    return this.quantity > 0;
  }
}
