import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain
import { BasketEntity } from './domain/basket/basket.entity';
import { BasketItemEntity } from './domain/basket/basket-item.entity';
import { BasketBundleEntity } from './domain/basket/basket-bundle.entity';

// Application
import { BasketUseCases } from './application/use-cases/basket.use-cases';
import { CheckoutUseCases } from './application/use-cases/checkout.use-cases';

// Adapters
import { BasketController } from './adapters/inbound/basket.controller.js';
import { BasketRepositoryImplementation } from './repository/basket.repository.impl.js';

// Policy module import will be handled via forwardRef
import { PolicyModule } from '../policy/policy.module';
import { OrderModule } from 'src/order/order.module';


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
      useClass: BasketRepositoryImplementation,
    },
  ],
  exports: [BasketUseCases, CheckoutUseCases, 'IBasketRepository'],
})
export class BasketModule {}
