import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasketEntity } from '../../domain/basket/basket.entity';
import { BasketItemEntity } from '../../domain/basket/basket-item.entity';
import { BasketBundleEntity } from '../../domain/basket/basket-bundle.entity';
import { BasketUseCases } from '../../application/use-cases/basket/basket.use-cases';
import { CheckoutUseCases } from '../../application/use-cases/checkout/checkout.use-cases';
import { BasketController } from '../../adapters/inbound/basket.controller';
import { BasketRepositoryImplementation } from '../../repository/basket.repository.impl';
import { IBasketRepository } from '../../domain/basket/basket.repository';

import { PolicyServicePort } from 'src/basket/application/ports/policy-service.port';
import { PolicyServiceAdapter } from 'src/basket/adapters/outbound/policy-service.adapter';
import { OrderServicePort } from 'src/basket/application/ports/order-service.port';
import { OrderServiceAdapter } from 'src/basket/adapters/outbound/order-service.adapter';
import {
  BASKET_SPECIFICATION_REGISTRY_TOKEN,
  BasketSpecificationRegistry,
} from '../../application/specifications/basket-policy.specification';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BasketEntity,
      BasketItemEntity,
      BasketBundleEntity,
    ]),
  ],
  controllers: [BasketController],
  providers: [
    BasketUseCases,
    CheckoutUseCases,
    {
      provide: IBasketRepository.name,
      useClass: BasketRepositoryImplementation,
    },
    {
      provide: PolicyServicePort.name,
      useClass: PolicyServiceAdapter,
    },
    {
      provide: OrderServicePort.name,
      useClass: OrderServiceAdapter,
    },
    {
      provide: BASKET_SPECIFICATION_REGISTRY_TOKEN,
      useValue: BasketSpecificationRegistry,
    },
  ],
  exports: [BasketUseCases, CheckoutUseCases, IBasketRepository.name],
})
export class BasketModule {}
