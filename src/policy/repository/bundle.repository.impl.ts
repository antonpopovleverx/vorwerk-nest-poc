import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BundleEntity } from '@policy/domain/price-policy/bundle/bundle.entity.js';
import { IBundleRepository } from '@policy/domain/price-policy/bundle/bundle.repository.js';
import { Repository, In } from 'typeorm';

/**
 * TypeORM implementation of bundle repository
 */
@Injectable()
export class BundleRepositoryImpl implements IBundleRepository {
  constructor(
    @InjectRepository(BundleEntity)
    private readonly repository: Repository<BundleEntity>,
  ) {}

  async findById(bundleId: string): Promise<BundleEntity | null> {
    return this.repository.findOne({
      where: { bundleId },
      relations: ['contents'],
    });
  }

  async findByIds(bundleIds: string[]): Promise<BundleEntity[]> {
    if (bundleIds.length === 0) return [];
    return this.repository.find({
      where: { bundleId: In(bundleIds) },
      relations: ['contents'],
    });
  }

  async findAll(): Promise<BundleEntity[]> {
    return this.repository.find({ relations: ['contents'] });
  }

  async findActive(): Promise<BundleEntity[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['contents'],
    });
  }

  async save(bundle: BundleEntity): Promise<BundleEntity> {
    return this.repository.save(bundle);
  }

  async delete(bundleId: string): Promise<void> {
    await this.repository.delete({ bundleId });
  }
}
