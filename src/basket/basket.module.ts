import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain
import { BasketEntity } from '@basket/domain/basket/basket.entity.js';
import { BasketItemEntity } from '@basket/domain/basket/basket-item.entity.js';
import { BasketBundleEntity } from '@basket/domain/basket/basket-bundle.entity.js';

// Application
import { BasketUseCases } from '@basket/application/use-cases/basket.use-cases.js';
import { CheckoutUseCases } from '@basket/application/use-cases/checkout.use-cases.js';

// Adapters
import { BasketController } from '@basket/adapters/inbound/basket.controller.js';
import { BasketRepositoryImpl } from '@basket/repository/basket.repository.impl.js';

// Policy module import will be handled via forwardRef
import { PolicyModule } from '@policy/policy.module';
import { OrderModule } from '@order/order.module';

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
