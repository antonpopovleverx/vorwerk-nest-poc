import { Injectable, Inject } from '@nestjs/common';
import { OrderEntity } from '../../../domain/order/order.entity';
import { IOrderRepository } from '../../../domain/order/order.repository';
import { IQuoteRepository } from '../../../domain/quote/quote.repository';
import {
  QuoteEntity,
  QuoteBasketSnapshot,
} from '../../../domain/quote/quote.entity';
import {
  PaymentServicePort,
  PaymentResult,
} from '../../ports/payment-service.port';
import {
  DeliveryServicePort,
  DeliveryResult,
} from '../../ports/delivery-service.port';
import { OrderUseCases, OrderData } from './order.use-cases';
import { isFound } from '../../../../_common/domain/specifications/specification.interface';

export class OrderSagaResult {
  success!: boolean;
  order?: OrderData;
  error?: string;
}

/**
 * Example of an ad-hoc saga orchestrator (mock implementation - not for refernce)
 * States: Initialized -> PaymentInitiated -> DeliveryInitiated -> Delivered
 * With compensatory actions on failure
 */
@Injectable()
export class OrderSagaUseCases {
  constructor(
    @Inject(IOrderRepository.name)
    private readonly orderRepository: IOrderRepository,
    @Inject(IQuoteRepository.name)
    private readonly quoteRepository: IQuoteRepository,
    @Inject(PaymentServicePort.name)
    private readonly paymentAdapter: PaymentServicePort,
    @Inject(DeliveryServicePort.name)
    private readonly deliveryAdapter: DeliveryServicePort,
  ) {}

  async executeOrderSaga(orderId: string): Promise<OrderSagaResult> {
    let order: OrderEntity | null =
      await this.orderRepository.findById(orderId);
    if (!isFound(order)) {
      return {
        success: false,
        order: undefined,
        error: `Order ${orderId} not found`,
      };
    }

    const quote: QuoteEntity | null = await this.quoteRepository.findById(
      order.quoteId,
    );
    if (!isFound(quote)) {
      order.markFailed('Quote not found');
      order = await this.orderRepository.save(order);
      return {
        success: false,
        order: this.mapEntityToData(order),
        error: 'Quote not found',
      };
    }

    try {
      const paymentResult: PaymentResult =
        await this.paymentAdapter.processPayment({
          orderId,
          userId: order.userId,
          amount: quote.getTotalPrice(),
          SupportedCurrency: quote.SupportedCurrency,
        });

      if (!paymentResult.success || !paymentResult.paymentReference) {
        order.markFailed(`Payment failed: ${paymentResult.error}`);
        order = await this.orderRepository.save(order);
        return {
          success: false,
          order: this.mapEntityToData(order),
          error: `Payment failed: ${paymentResult.error}`,
        };
      }

      order.initiatePayment(paymentResult.paymentReference);
      order = await this.orderRepository.save(order);

      const basketSnapshot: QuoteBasketSnapshot = quote.basketSnapshot;
      const deliveryResult: DeliveryResult =
        await this.deliveryAdapter.initiateDelivery({
          orderId,
          userId: order.userId,
          items: basketSnapshot.items,
          bundles: basketSnapshot.bundles,
        });

      if (!deliveryResult.success || !deliveryResult.deliveryReference) {
        await this.compensatePayment(order, 'Delivery initiation failed');

        order.markFailed(`Delivery failed: ${deliveryResult.error}`);
        order = await this.orderRepository.save(order);
        return {
          success: false,
          order: this.mapEntityToData(order),
          error: `Delivery failed: ${deliveryResult.error}`,
        };
      }

      order.initiateDelivery(deliveryResult.deliveryReference);
      order = await this.orderRepository.save(order);

      order.markDelivered();
      order = await this.orderRepository.save(order);

      return {
        success: true,
        order: this.mapEntityToData(order),
      };
    } catch (error) {
      if (order.paymentReference) {
        await this.compensatePayment(order, 'Saga execution failed');
      }
      if (order.deliveryReference) {
        await this.compensateDelivery(order, 'Saga execution failed');
      }

      order.markFailed(
        error instanceof Error ? error.message : 'Saga execution failed',
      );
      order = await this.orderRepository.save(order);

      return {
        success: false,
        order: this.mapEntityToData(order),
        error: error instanceof Error ? error.message : 'Saga execution failed',
      };
    }
  }

  private async compensatePayment(
    order: OrderEntity,
    reason: string,
  ): Promise<void> {
    if (!order.paymentReference) return;

    try {
      const quote: QuoteEntity | null = await this.quoteRepository.findById(
        order.quoteId,
      );
      if (isFound(quote)) {
        await this.paymentAdapter.refundPayment({
          paymentReference: order.paymentReference,
          amount: quote.getTotalPrice(),
          reason,
        });
      }
    } catch (error) {}
  }

  private async compensateDelivery(
    order: OrderEntity,
    reason: string,
  ): Promise<void> {
    if (!order.deliveryReference) return;

    try {
      await this.deliveryAdapter.cancelDelivery({
        deliveryReference: order.deliveryReference,
        reason,
      });
    } catch (error) {}
  }

  async executePaymentStep(orderId: string): Promise<OrderSagaResult> {
    let order: OrderEntity | null =
      await this.orderRepository.findById(orderId);
    if (!isFound(order)) {
      return { success: false, order: undefined, error: 'Order not found' };
    }

    const quote: QuoteEntity | null = await this.quoteRepository.findById(
      order.quoteId,
    );
    if (!isFound(quote)) {
      return {
        success: false,
        order: this.mapEntityToData(order),
        error: 'Quote not found',
      };
    }

    const result: PaymentResult = await this.paymentAdapter.processPayment({
      orderId,
      userId: order.userId,
      amount: quote.getTotalPrice(),
      SupportedCurrency: quote.SupportedCurrency,
    });

    if (result.success && result.paymentReference) {
      order.initiatePayment(result.paymentReference);
      order = await this.orderRepository.save(order);

      return { success: true, order: this.mapEntityToData(order) };
    }

    order.markFailed(`Payment failed: ${result.error}`);
    order = await this.orderRepository.save(order);

    return {
      success: false,
      order: this.mapEntityToData(order),
      error: result.error,
    };
  }

  async executeDeliveryStep(orderId: string): Promise<OrderSagaResult> {
    let order: OrderEntity | null =
      await this.orderRepository.findById(orderId);
    if (!isFound(order)) {
      return { success: false, order: undefined, error: 'Order not found' };
    }

    const quote: QuoteEntity | null = await this.quoteRepository.findById(
      order.quoteId,
    );
    if (!isFound(quote)) {
      return {
        success: false,
        order: this.mapEntityToData(order),
        error: 'Quote not found',
      };
    }

    const basketSnapshot: QuoteBasketSnapshot = quote.basketSnapshot;
    const result: DeliveryResult = await this.deliveryAdapter.initiateDelivery({
      orderId,
      userId: order.userId,
      items: basketSnapshot.items,
      bundles: basketSnapshot.bundles,
    });

    if (result.success && result.deliveryReference) {
      order.initiateDelivery(result.deliveryReference);
      order = await this.orderRepository.save(order);

      return { success: true, order: this.mapEntityToData(order) };
    }

    await this.compensatePayment(order, 'Delivery failed');
    order.markFailed(`Delivery failed: ${result.error}`);
    order = await this.orderRepository.save(order);

    return {
      success: false,
      order: this.mapEntityToData(order),
      error: result.error,
    };
  }

  private mapEntityToData(order: OrderEntity): OrderData {
    return {
      orderId: order.orderId,
      userId: order.userId,
      quoteId: order.quoteId,
      businessPartnerId: order.businessPartnerId || undefined,
      status: order.status,
      paymentReference: order.paymentReference ?? undefined,
      deliveryReference: order.deliveryReference ?? undefined,
      failureReason: order.failureReason ?? undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
