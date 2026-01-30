import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Base entity with mandatory technical fields
 */
export abstract class TechnicalEntity {
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
