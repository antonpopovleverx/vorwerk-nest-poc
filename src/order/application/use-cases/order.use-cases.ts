import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { OrderEntity } from '../../domain/order/order.entity';
import { OrderStatus } from '../../domain/order/order-status.enum';
import { IOrderRepository } from '../../domain/order/order.repository';
import { IQuoteRepository } from '../../domain/quote/quote.repository';
import { isFound } from '../../../_common/domain/specifications/specification.interface';

/**
 * Neutral order data structure returned by use cases
 */
export class OrderData {
  orderId: string;
  userId: string;
  quoteId: string;
  businessPartnerId?: string;
  status: OrderStatus;
  paymentReference?: string;
  deliveryReference?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create order from quote command
 */
export class CreateOrderFromQuoteCommand {
  quoteId!: string;
}

/**
 * Order use cases - basic order CRUD
 */
@Injectable()
export class OrderUseCases {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('IQuoteRepository')
    private readonly quoteRepository: IQuoteRepository,
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
   * Create order from quote
   */
  async createOrderFromQuote(
    command: CreateOrderFromQuoteCommand,
  ): Promise<OrderData> {
    const quote = await this.quoteRepository.findById(command.quoteId);
    if (!isFound(quote)) {
      throw new HttpException(
        `Quote ${command.quoteId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if order already exists for this quote
    const existingOrder = await this.orderRepository.findByQuoteId(
      command.quoteId,
    );
    if (isFound(existingOrder)) {
      throw new HttpException(
        `Order already exists for quote ${command.quoteId}`,
        HttpStatus.CONFLICT,
      );
    }

    const order = OrderEntity.createFromQuote(
      quote.quoteId,
      quote.userId,
      quote.businessPartnerId ?? undefined,
    );

    const savedOrder = await this.orderRepository.save(order);

    return this.mapEntityToData(savedOrder);
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<OrderData> {
    const order = await this.orderRepository.findById(orderId);
    if (!isFound(order)) {
      throw new HttpException(
        `Order ${orderId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.mapEntityToData(order);
  }

  /**
   * Get order by quote ID
   */
  async getOrderByQuoteId(quoteId: string): Promise<OrderData | null> {
    const order = await this.orderRepository.findByQuoteId(quoteId);

    return order ? this.mapEntityToData(order) : null;
  }

  /**
   * Get orders for user
   */
  async getOrdersForUser(userId: string): Promise<OrderData[]> {
    const orders = await this.orderRepository.findByUserId(userId);

    return orders.map((order) => this.mapEntityToData(order));
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: OrderStatus): Promise<OrderData[]> {
    const orders = await this.orderRepository.findByStatus(status);

    return orders.map((order) => this.mapEntityToData(order));
  }

  /**
   * Update order (save changes)
   */
  async updateOrder(order: OrderEntity): Promise<OrderData> {
    const savedOrder = await this.orderRepository.save(order);

    return this.mapEntityToData(savedOrder);
  }
}
