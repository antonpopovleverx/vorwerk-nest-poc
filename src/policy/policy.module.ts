import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain entities
import { BundleEntity } from './domain/price-policy/bundle/bundle.entity.js';
import { BundleContentEntity } from './domain/price-policy/bundle/bundle-content.entity.js';
import { ItemPriceEntity } from './domain/price-policy/item-price.entity.js';
import { ItemDiscountEntity } from './domain/price-policy/item-discount.entity.js';

// Application use cases
import { PricePolicyUseCases } from './application/use-cases/price-policy.use-cases.js';
import { BasketPolicyUseCases } from './application/use-cases/basket-policy.use-cases.js';
import { BundleUseCases } from './application/use-cases/bundle.use-cases.js';

// Adapters
import { BundleController } from './adapters/inbound/bundle.controller.js';
import { BundleRepositoryImpl } from './repository/bundle.repository.impl.js';
import { PricePolicyRepositoryImpl } from './repository/price-policy.repository.impl.js';
import { PolicyServiceAdapter } from './adapters/outbound/policy-service.adapter.js';

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
      useClass: BundleRepositoryImpl,
    },
    {
      provide: 'IPricePolicyRepository',
      useClass: PricePolicyRepositoryImpl,
    },
    // Adapter for basket subdomain
    {
      provide: 'IPolicyServicePort',
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
