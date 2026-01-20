import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain entities
import { OrderEntity } from './domain/order/order.entity.js';
import { QuoteEntity } from './domain/quote/quote.entity.js';

// Application use cases
import { QuoteUseCases } from './application/use-cases/quote.use-cases.js';
import { OrderUseCases } from './application/use-cases/order.use-cases.js';
import { OrderSagaUseCases } from './application/use-cases/order-saga.use-cases.js';

// Adapters
import { OrderController } from './adapters/inbound/order.controller.js';
import { OrderRepositoryImpl } from './repository/order.repository.impl.js';
import { QuoteRepositoryImpl } from './repository/quote.repository.impl.js';
import { PaymentServiceMock } from './adapters/outbound/payment-service.mock.js';
import { DeliveryServiceMock } from './adapters/outbound/delivery-service.mock.js';
import { OrderServiceAdapter } from './adapters/outbound/order-service.adapter.js';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, QuoteEntity])],
  controllers: [OrderController],
  providers: [
    // Use Cases
    QuoteUseCases,
    OrderUseCases,
    OrderSagaUseCases,
    // Repositories
    {
      provide: 'IOrderRepository',
      useClass: OrderRepositoryImpl,
    },
    {
      provide: 'IQuoteRepository',
      useClass: QuoteRepositoryImpl,
    },
    // External service mocks
    {
      provide: 'IPaymentServicePort',
      useClass: PaymentServiceMock,
    },
    {
      provide: 'IDeliveryServicePort',
      useClass: DeliveryServiceMock,
    },
    // Adapter for basket subdomain
    {
      provide: 'IOrderServicePort',
      useClass: OrderServiceAdapter,
    },
  ],
  exports: [
    QuoteUseCases,
    OrderUseCases,
    OrderSagaUseCases,
    'IOrderRepository',
    'IQuoteRepository',
    'IOrderServicePort',
  ],
})
export class OrderModule {}
