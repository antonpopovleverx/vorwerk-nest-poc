import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain
import { BasketEntity } from './domain/basket/basket.entity.js';
import { BasketItemEntity } from './domain/basket/basket-item.entity.js';
import { BasketBundleEntity } from './domain/basket/basket-bundle.entity.js';

// Application
import { BasketUseCases } from './application/use-cases/basket.use-cases.js';
import { CheckoutUseCases } from './application/use-cases/checkout.use-cases.js';

// Adapters
import { BasketController } from './adapters/inbound/basket.controller.js';
import { BasketRepositoryImpl } from './repository/basket.repository.impl.js';

// Policy module import will be handled via forwardRef
import { PolicyModule } from '../policy/policy.module.js';
import { OrderModule } from '../order/order.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BasketEntity,
      BasketItemEntity,
      BasketBundleEntity,
    ]),
    forwardRef(() => PolicyModule),
    forwardRef(() => OrderModule),
  ],
  controllers: [BasketController],
  providers: [
    // Use Cases
    BasketUseCases,
    CheckoutUseCases,
    // Repository
    {
      provide: 'IBasketRepository',
      useClass: BasketRepositoryImpl,
    },
  ],
  exports: [BasketUseCases, CheckoutUseCases, 'IBasketRepository'],
})
export class BasketModule {}

