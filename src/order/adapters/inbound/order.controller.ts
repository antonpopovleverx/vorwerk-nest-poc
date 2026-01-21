import {
  Controller,
  Get,
  Post,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrderUseCases, OrderData } from '../../application/use-cases/order.use-cases';
import { OrderSagaUseCases } from '../../application/use-cases/order-saga.use-cases';
import { QuoteUseCases } from '../../application/use-cases/quote.use-cases';
import {
  OrderGetResponseDto,
  OrderGetQueryResponseDto,
  QuoteGetResponseDto,
  OrderSagaExecutionResponseDto,
  OrderPaymentResponseDto,
  OrderDeliveryResponseDto,
} from './order.dto';

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
  async getOrder(
    @Param('orderId') orderId: string,
  ): Promise<OrderGetResponseDto> {
    const order = await this.orderUseCases.getOrder(orderId);
    return this.mapOrderToResponse(order);
  }

  /**
   * Get orders for user
   */
  @Get('user/:userId')
  async getOrdersForUser(
    @Param('userId') userId: string,
  ): Promise<OrderGetQueryResponseDto> {
    const orders = await this.orderUseCases.getOrdersForUser(userId);
    return { orders: orders.map((o) => this.mapOrderToResponse(o)) };
  }

  /**
   * Create order from quote and execute saga
   */
  @Post('from-quote/:quoteId')
  async createOrderFromQuote(
    @Param('quoteId') quoteId: string,
  ): Promise<OrderSagaExecutionResponseDto> {
    // Create order
    const order = await this.orderUseCases.createOrderFromQuote({ quoteId });

    // Execute saga
    const sagaResult = await this.orderSagaUseCases.executeOrderSaga(
      order.orderId,
    );

    return {
      success: sagaResult.success,
      order: sagaResult.order
        ? this.mapOrderToResponse(sagaResult.order)
        : undefined,
      error: sagaResult.error,
    };
  }

  /**
   * Execute saga for existing order
   */
  @Post(':orderId/execute-saga')
  async executeSaga(
    @Param('orderId') orderId: string,
  ): Promise<OrderSagaExecutionResponseDto> {
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
  async executePayment(
    @Param('orderId') orderId: string,
  ): Promise<OrderPaymentResponseDto> {
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
  async executeDelivery(
    @Param('orderId') orderId: string,
  ): Promise<OrderDeliveryResponseDto> {
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
  async getQuote(
    @Param('quoteId') quoteId: string,
  ): Promise<QuoteGetResponseDto> {
    const quote = await this.quoteUseCases.getQuote(quoteId);
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

  private mapOrderToResponse(order: OrderData): OrderGetResponseDto {
    return {
      orderId: order.orderId,
      userId: order.userId,
      quoteId: order.quoteId,
      businessPartnerId: order.businessPartnerId,
      status: order.status,
      paymentReference: order.paymentReference,
      deliveryReference: order.deliveryReference,
      failureReason: order.failureReason,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
