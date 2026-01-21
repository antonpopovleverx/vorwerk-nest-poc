import { Injectable, Inject, Logger } from '@nestjs/common';
import { OrderEntity } from '../../domain/order/order.entity';
import { IOrderRepository } from '../../domain/order/order.repository';
import { IQuoteRepository } from '../../domain/quote/quote.repository';
import { IPaymentServicePort } from '../ports/payment-service.port';
import { IDeliveryServicePort } from '../ports/delivery-service.port';
import { OrderUseCases, OrderData } from './order.use-cases';
import { isFound } from '../../../_common/domain/specifications/specification.interface';

/**
 * Order saga result
 */
export class OrderSagaResult {
  success!: boolean;
  order?: OrderData;
  error?: string;
}

/**
 * Order saga orchestrator - manages the order fulfillment process
 * States: Initialized -> PaymentInitiated -> DeliveryInitiated -> Delivered
 * With compensatory actions on failure
 */
@Injectable()
export class OrderSagaUseCases {
  private readonly logger = new Logger(OrderSagaUseCases.name);

  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('IQuoteRepository')
    private readonly quoteRepository: IQuoteRepository,
    @Inject('IPaymentServicePort')
    private readonly paymentService: IPaymentServicePort,
    @Inject('IDeliveryServicePort')
    private readonly deliveryService: IDeliveryServicePort,
    private readonly orderUseCases: OrderUseCases,
  ) {}

  /**
   * Convert OrderEntity to neutral OrderData
   */
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

  /**
   * Execute the full order saga
   */
  async executeOrderSaga(orderId: string): Promise<OrderSagaResult> {
    let order = await this.orderRepository.findById(orderId);
    if (!isFound(order)) {
      return {
        success: false,
        order: undefined,
        error: `Order ${orderId} not found`,
      };
    }

    const quote = await this.quoteRepository.findById(order.quoteId);
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
      // Step 1: Process payment
      this.logger.log(`Processing payment for order ${orderId}`);
      const paymentResult = await this.paymentService.processPayment({
        orderId,
        userId: order.userId,
        amount: quote.getTotalPrice(),
        currency: quote.currency,
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
      this.logger.log(`Payment successful: ${paymentResult.paymentReference}`);

      // Step 2: Initiate delivery
      this.logger.log(`Initiating delivery for order ${orderId}`);
      const basketSnapshot = quote.basketSnapshot;
      const deliveryResult = await this.deliveryService.initiateDelivery({
        orderId,
        userId: order.userId,
        items: basketSnapshot.items,
        bundles: basketSnapshot.bundles,
      });

      if (!deliveryResult.success || !deliveryResult.deliveryReference) {
        // Compensate: Refund payment
        this.logger.warn(`Delivery failed, refunding payment`);
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
      this.logger.log(
        `Delivery initiated: ${deliveryResult.deliveryReference}`,
      );

      // Step 3: Check delivery completion (in real system, this would be async/webhook)
      // For POC, we'll simulate immediate delivery
      this.logger.log(`Marking order as delivered`);
      order.markDelivered();
      order = await this.orderRepository.save(order);

      return {
        success: true,
        order: this.mapEntityToData(order),
      };
    } catch (error) {
      this.logger.error(`Saga failed: ${error}`);

      // Attempt compensation
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

  /**
   * Compensate payment (refund)
   */
  private async compensatePayment(
    order: OrderEntity,
    reason: string,
  ): Promise<void> {
    if (!order.paymentReference) return;

    try {
      const quote = await this.quoteRepository.findById(order.quoteId);
      if (isFound(quote)) {
        await this.paymentService.refundPayment({
          paymentReference: order.paymentReference,
          amount: quote.getTotalPrice(),
          reason,
        });
        this.logger.log(`Payment refunded: ${order.paymentReference}`);
      }
    } catch (error) {
      this.logger.error(`Failed to refund payment: ${error}`);
      // In production, this would need manual intervention or retry logic
    }
  }

  /**
   * Compensate delivery (cancel)
   */
  private async compensateDelivery(
    order: OrderEntity,
    reason: string,
  ): Promise<void> {
    if (!order.deliveryReference) return;

    try {
      await this.deliveryService.cancelDelivery({
        deliveryReference: order.deliveryReference,
        reason,
      });
      this.logger.log(`Delivery cancelled: ${order.deliveryReference}`);
    } catch (error) {
      this.logger.error(`Failed to cancel delivery: ${error}`);
      // In production, this would need manual intervention or retry logic
    }
  }

  /**
   * Execute saga step by step (for manual control/debugging)
   */
  async executePaymentStep(orderId: string): Promise<OrderSagaResult> {
    let order = await this.orderRepository.findById(orderId);
    if (!isFound(order)) {
      return { success: false, order: undefined, error: 'Order not found' };
    }

    const quote = await this.quoteRepository.findById(order.quoteId);
    if (!isFound(quote)) {
      return {
        success: false,
        order: this.mapEntityToData(order),
        error: 'Quote not found',
      };
    }

    const result = await this.paymentService.processPayment({
      orderId,
      userId: order.userId,
      amount: quote.getTotalPrice(),
      currency: quote.currency,
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
    let order = await this.orderRepository.findById(orderId);
    if (!isFound(order)) {
      return { success: false, order: undefined, error: 'Order not found' };
    }

    const quote = await this.quoteRepository.findById(order.quoteId);
    if (!isFound(quote)) {
      return {
        success: false,
        order: this.mapEntityToData(order),
        error: 'Quote not found',
      };
    }

    const basketSnapshot = quote.basketSnapshot;
    const result = await this.deliveryService.initiateDelivery({
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

    // Compensate payment
    await this.compensatePayment(order, 'Delivery failed');
    order.markFailed(`Delivery failed: ${result.error}`);
    order = await this.orderRepository.save(order);

    return {
      success: false,
      order: this.mapEntityToData(order),
      error: result.error,
    };
  }
}
