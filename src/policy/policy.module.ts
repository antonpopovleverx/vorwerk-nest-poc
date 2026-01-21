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
import { IPolicyServicePort } from 'src/basket/application/ports/policy-service.port';

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
      provide: 'IBundleRepository',
      useClass: BundleRepositoryImplementation,
    },
    {
      provide: 'IPricePolicyRepository', //TODO: don't hardcode the abstract class name
      useClass: PricePolicyRepositoryImplementation,
    },
    // Adapter for basket subdomain
    {
      provide: IPolicyServicePort.name, //TODO: no "I" in front of ports, just "port" is enough
      useClass: PolicyServiceAdapter,
    },
  ],
  exports: [
    PricePolicyUseCases,
    BasketPolicyUseCases,
    BundleUseCases,
    'IBundleRepository',
    'IPricePolicyRepository',
    'IPolicyServicePort',
  ],
})
export class PolicyModule {}
