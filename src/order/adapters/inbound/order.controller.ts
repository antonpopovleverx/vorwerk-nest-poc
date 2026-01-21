import {
  Controller,
  Get,
  Post,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
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
@ApiTags('Orders')
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
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Retrieves detailed information about a specific order by its unique identifier.',
  })
  @ApiParam({
    name: 'orderId',
    description: 'The unique identifier of the order',
    example: 'order-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderGetResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Order not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Get orders for user',
    description: 'Retrieves a list of all orders placed by a specific user.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user',
    example: 'user-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: OrderGetQueryResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Create order from quote',
    description: 'Creates a new order from an existing quote and automatically executes the order fulfillment saga (payment and delivery).',
  })
  @ApiParam({
    name: 'quoteId',
    description: 'The unique identifier of the quote to create order from',
    example: 'quote-789',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created and saga executed successfully',
    type: OrderSagaExecutionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Quote not found, invalid quote state, or saga execution failed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Quote not found or quote already used to create order' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Quote not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Quote not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Execute order fulfillment saga',
    description: 'Executes the complete order fulfillment saga (payment and delivery) for an existing order.',
  })
  @ApiParam({
    name: 'orderId',
    description: 'The unique identifier of the order',
    example: 'order-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Saga executed successfully',
    type: OrderSagaExecutionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Order not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Order is not in correct state for saga execution',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Order is not in pending state' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Execute payment step',
    description: 'Executes only the payment processing step of the order fulfillment saga.',
  })
  @ApiParam({
    name: 'orderId',
    description: 'The unique identifier of the order',
    example: 'order-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment step executed successfully',
    type: OrderPaymentResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Order not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Payment already processed or order in wrong state',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Payment already processed for this order' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Execute delivery step',
    description: 'Executes only the delivery processing step of the order fulfillment saga.',
  })
  @ApiParam({
    name: 'orderId',
    description: 'The unique identifier of the order',
    example: 'order-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Delivery step executed successfully',
    type: OrderDeliveryResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Order not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Delivery already processed, payment not completed, or order in wrong state',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Payment must be completed before delivery' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Get quote by ID',
    description: 'Retrieves detailed information about a specific quote by its unique identifier.',
  })
  @ApiParam({
    name: 'quoteId',
    description: 'The unique identifier of the quote',
    example: 'quote-789',
  })
  @ApiResponse({
    status: 200,
    description: 'Quote retrieved successfully',
    type: QuoteGetResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Quote not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Quote not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
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
