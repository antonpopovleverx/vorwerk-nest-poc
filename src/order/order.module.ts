import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain entities
import { OrderEntity } from './domain/order/order.entity';
import { QuoteEntity } from './domain/quote/quote.entity';

// Application use cases
import { QuoteUseCases } from './application/use-cases/quote.use-cases';
import { OrderUseCases } from './application/use-cases/order.use-cases';
import { OrderSagaUseCases } from './application/use-cases/order-saga.use-cases';

// Adapters
import { OrderController } from './adapters/inbound/order.controller.js';
import { OrderRepositoryImplementation } from './repository/order.repository.impl.js';
import { QuoteRepositoryImplementation } from './repository/quote.repository.impl.js';
import { PaymentServiceMock } from './adapters/outbound/payment-service.mock.js';
import { DeliveryServiceMock } from './adapters/outbound/delivery-service.mock.js';
import { OrderServiceAdapter } from './adapters/outbound/order-service.adapter.js';
import { IOrderRepository } from './domain/order/order.repository';
import { IQuoteRepository } from './domain/quote/quote.repository';
import { PaymentServicePort } from './application/ports/payment-service.port';
import { DeliveryServicePort } from './application/ports/delivery-service.port';
import { OrderServicePort } from 'src/basket/application/ports/order-service.port';

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
      provide: IOrderRepository.name,
      useClass: OrderRepositoryImplementation,
    },
    {
      provide: IQuoteRepository.name,
      useClass: QuoteRepositoryImplementation,
    },
    // External service mocks
    {
      provide: PaymentServicePort.name,
      useClass: PaymentServiceMock,
    },
    {
      provide: DeliveryServicePort.name,
      useClass: DeliveryServiceMock,
    },
    // Adapter for basket subdomain
    {
      provide: OrderServicePort.name,
      useClass: OrderServiceAdapter,
    },
  ],
  exports: [
    QuoteUseCases,
    OrderUseCases,
    OrderSagaUseCases,
    IOrderRepository.name,
    IQuoteRepository.name,
    OrderServicePort.name,
  ],
})
export class OrderModule {}
