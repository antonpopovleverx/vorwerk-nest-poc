import {
  Controller,
  Get,
  Post,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrderUseCases } from '../../application/use-cases/order.use-cases';
import { OrderSagaUseCases } from '../../application/use-cases/order-saga.use-cases';
import { QuoteUseCases } from '../../application/use-cases/quote.use-cases';

/**
 * Order controller - handles HTTP requests for order operations
 */
@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderUseCases: OrderUseCases,
    private readonly orderSagaUseCases: OrderSagaUseCases,
    private readonly quoteUseCases: QuoteUseCases,
  ) {}

  /**
   * Get order by ID
   */
  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string) {
    const order = await this.orderUseCases.getOrder(orderId);
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return this.mapOrderToResponse(order);
  }

  /**
   * Get orders for user
   */
  @Get('user/:userId')
  async getOrdersForUser(@Param('userId') userId: string) {
    const orders = await this.orderUseCases.getOrdersForUser(userId);
    return orders.map((o) => this.mapOrderToResponse(o));
  }

  /**
   * Create order from quote and execute saga
   */
  @Post('from-quote/:quoteId')
  async createOrderFromQuote(@Param('quoteId') quoteId: string) {
    try {
      // Create order
      const order = await this.orderUseCases.createOrderFromQuote({ quoteId });

      // Execute saga
      const sagaResult = await this.orderSagaUseCases.executeOrderSaga(
        order.orderId,
      );

      return {
        success: sagaResult.success,
        order: this.mapOrderToResponse(sagaResult.order),
        error: sagaResult.error,
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to create order',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Execute saga for existing order
   */
  @Post(':orderId/execute-saga')
  async executeSaga(@Param('orderId') orderId: string) {
    const result = await this.orderSagaUseCases.executeOrderSaga(orderId);

    if (!result.order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    return {
      success: result.success,
      order: this.mapOrderToResponse(result.order),
      error: result.error,
    };
  }

  /**
   * Execute payment step only
   */
  @Post(':orderId/payment')
  async executePayment(@Param('orderId') orderId: string) {
    const result = await this.orderSagaUseCases.executePaymentStep(orderId);

    if (!result.order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    return {
      success: result.success,
      order: this.mapOrderToResponse(result.order),
      error: result.error,
    };
  }

  /**
   * Execute delivery step only
   */
  @Post(':orderId/delivery')
  async executeDelivery(@Param('orderId') orderId: string) {
    const result = await this.orderSagaUseCases.executeDeliveryStep(orderId);

    if (!result.order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    return {
      success: result.success,
      order: this.mapOrderToResponse(result.order),
      error: result.error,
    };
  }

  /**
   * Get quote by ID
   */
  @Get('quotes/:quoteId')
  async getQuote(@Param('quoteId') quoteId: string) {
    const quote = await this.quoteUseCases.getQuote(quoteId);
    if (!quote) {
      throw new HttpException('Quote not found', HttpStatus.NOT_FOUND);
    }
    return {
      quoteId: quote.quoteId,
      userId: quote.userId,
      businessPartnerId: quote.businessPartnerId || undefined,
      price: quote.price,
      currency: quote.currency,
      basketSnapshot: quote.basketSnapshot,
      policySnapshot: quote.policySnapshot,
      createdAt: quote.createdAt,
    };
  }

  private mapOrderToResponse(order: any) {
    return {
      orderId: order.orderId,
      userId: order.userId,
      quoteId: order.quoteId,
      businessPartnerId: order.businessPartnerId || undefined,
      status: order.status,
      paymentReference: order.paymentReference,
      deliveryReference: order.deliveryReference,
      failureReason: order.failureReason,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
