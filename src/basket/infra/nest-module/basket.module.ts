import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasketEntity } from '../../domain/basket/basket.entity';
import { BasketItemEntity } from '../../domain/basket/basket-item.entity';
import { BasketBundleEntity } from '../../domain/basket/basket-bundle.entity';
import { BasketUseCases } from '../../application/use-cases/basket/basket.use-cases';
import { CheckoutUseCases } from '../../application/use-cases/checkout/checkout.use-cases';
import { BasketController } from '../../adapters/inbound/basket.controller.js';
import { BasketRepositoryImplementation } from '../../repository/basket.repository.impl.js';
import { IBasketRepository } from '../../domain/basket/basket.repository';
import { PolicyModule } from '../../../policy/infra/nest-module/policy.module';
import { OrderModule } from 'src/order/infra/nest-module/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BasketEntity,
      BasketItemEntity,
      BasketBundleEntity,
    ]),
    PolicyModule,
    OrderModule,
  ],
  controllers: [BasketController],
  providers: [
    BasketUseCases,
    CheckoutUseCases,
    {
      provide: IBasketRepository.name,
      useClass: BasketRepositoryImplementation,
    },
  ],
  exports: [BasketUseCases, CheckoutUseCases, IBasketRepository.name],
})
export class BasketModule {}
