import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Base entity with common audit fields
 */
export abstract class BaseEntity {
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
