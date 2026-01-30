import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../../domain/order/order.entity';
import { QuoteEntity } from '../../domain/quote/quote.entity';
import { QuoteUseCases } from '../../application/use-cases/quote/quote.use-cases';
import { OrderUseCases } from '../../application/use-cases/order/order.use-cases';
import { OrderSagaUseCases } from '../../application/use-cases/order/order-saga.use-cases';
import { OrderController } from '../../adapters/inbound/order.controller';
import { OrderRepositoryImplementation } from '../../repository/order/order.repository.impl';
import { QuoteRepositoryImplementation } from '../../repository/quote/quote.repository.impl';
import { PaymentServiceMock } from '../../adapters/outbound/payment-service.mock';
import { DeliveryServiceMock } from '../../adapters/outbound/delivery-service.mock';
import { OrderServiceAdapter } from '../../../basket/adapters/outbound/order-service.adapter';
import { IOrderRepository } from '../../domain/order/order.repository';
import { IQuoteRepository } from '../../domain/quote/quote.repository';
import { PaymentServicePort } from '../../application/ports/payment-service.port';
import { DeliveryServicePort } from '../../application/ports/delivery-service.port';
import { OrderServicePort } from 'src/basket/application/ports/order-service.port';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, QuoteEntity])],
  controllers: [OrderController],
  providers: [

    QuoteUseCases,
    OrderUseCases,
    OrderSagaUseCases,

    {
      provide: IOrderRepository.name,
      useClass: OrderRepositoryImplementation,
    },
    {
      provide: IQuoteRepository.name,
      useClass: QuoteRepositoryImplementation,
    },

    {
      provide: PaymentServicePort.name,
      useClass: PaymentServiceMock,
    },
    {
      provide: DeliveryServicePort.name,
      useClass: DeliveryServiceMock,
    },

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
