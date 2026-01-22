import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain entities
import { BundleEntity } from './domain/price-policy/bundle.entity';
import { BundleContentEntity } from './domain/price-policy/bundle-content.entity';
import { ItemPriceEntity } from './domain/price-policy/item-price.entity';
import { ItemDiscountEntity } from './domain/price-policy/item-discount.entity';

// Application use cases
import { PricePolicyUseCases } from './application/use-cases/price-policy.use-cases';
import { BasketPolicyUseCases } from './application/use-cases/basket-policy.use-cases';
import { BundleUseCases } from './application/use-cases/bundle.use-cases';

// Adapters
import { BundleController } from './adapters/inbound/bundle.controller.js';
import { BundleRepositoryImplementation } from './repository/bundle.repository.impl.js';
import { PricePolicyRepositoryImplementation } from './repository/price-policy.repository.impl.js';
import { PolicyServiceAdapter } from './adapters/outbound/policy-service.adapter.js';
import { IBundleRepository } from './domain/price-policy/bundle.repository';
import { IPricePolicyRepository } from './domain/price-policy/price-policy.repository';
import { PolicyServicePort } from 'src/basket/application/ports/policy-service.port';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BundleEntity,
      BundleContentEntity,
      ItemPriceEntity,
      ItemDiscountEntity,
    ]),
  ],
  controllers: [BundleController],
  providers: [
    // Use Cases
    PricePolicyUseCases,
    BasketPolicyUseCases,
    BundleUseCases,
    // Repositories
    {
      provide: IBundleRepository.name,
      useClass: BundleRepositoryImplementation,
    },
    {
      provide: IPricePolicyRepository.name,
      useClass: PricePolicyRepositoryImplementation,
    },
    // Adapter for basket subdomain
    {
      provide: PolicyServicePort.name,
      useClass: PolicyServiceAdapter,
    },
  ],
  exports: [
    PricePolicyUseCases,
    BasketPolicyUseCases,
    BundleUseCases,
    IBundleRepository.name,
    IPricePolicyRepository.name,
    PolicyServicePort.name,
  ],
})
export class PolicyModule {}
