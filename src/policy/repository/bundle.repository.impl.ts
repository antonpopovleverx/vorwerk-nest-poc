import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BundleEntity } from '../domain/price-policy/bundle.entity';
import { IBundleRepository } from '../domain/price-policy/bundle.repository';
import { Repository, In } from 'typeorm';

@Injectable()
export class BundleRepositoryImplementation implements IBundleRepository {
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
