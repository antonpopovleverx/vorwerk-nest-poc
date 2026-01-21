import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { OrderEntity } from '../../domain/order/order.entity';
import { OrderStatus } from '../../domain/order/order-status.enum';
import { IOrderRepository } from '../../domain/order/order.repository';
import { IQuoteRepository } from '../../domain/quote/quote.repository';

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
   * Create order from quote
   */
  async createOrderFromQuote(
    command: CreateOrderFromQuoteCommand,
  ): Promise<OrderEntity> {
    const quote = await this.quoteRepository.findById(command.quoteId);
    if (!quote) {
      throw new HttpException(`Quote ${command.quoteId} not found`, HttpStatus.NOT_FOUND);
    }


    // Check if order already exists for this quote
    const existingOrder = await this.orderRepository.findByQuoteId(command.quoteId);
    if (existingOrder) {
      throw new HttpException(`Order already exists for quote ${command.quoteId}`, HttpStatus.CONFLICT);
    }

    const order = OrderEntity.createFromQuote(
      quote.quoteId,
      quote.userId,
      quote.businessPartnerId ?? undefined,
    );

    return this.orderRepository.save(order);
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<OrderEntity | null> {
    return this.orderRepository.findById(orderId);
  }

  /**
   * Get order by quote ID
   */
  async getOrderByQuoteId(quoteId: string): Promise<OrderEntity | null> {
    return this.orderRepository.findByQuoteId(quoteId);
  }

  /**
   * Get orders for user
   */
  async getOrdersForUser(userId: string): Promise<OrderEntity[]> {
    return this.orderRepository.findByUserId(userId);
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: OrderStatus): Promise<OrderEntity[]> {
    return this.orderRepository.findByStatus(status);
  }

  /**
   * Update order (save changes)
   */
  async updateOrder(order: OrderEntity): Promise<OrderEntity> {
    return this.orderRepository.save(order);
  }
}
