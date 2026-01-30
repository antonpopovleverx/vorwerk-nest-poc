import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { OrderEntity } from '../../../domain/order/order.entity';
import { OrderStatus } from '../../../domain/order/order-status.enum';
import { IOrderRepository } from '../../../domain/order/order.repository';
import { IQuoteRepository } from '../../../domain/quote/quote.repository';
import { QuoteEntity } from '../../../domain/quote/quote.entity';
import { isFound } from '../../../../_common/domain/specifications/specification.interface';

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

export class CreateOrderFromQuoteCommand {
  quoteId!: string;
}

@Injectable()
export class OrderUseCases {
  constructor(
    @Inject(IOrderRepository.name)
    private readonly orderRepository: IOrderRepository,
    @Inject(IQuoteRepository.name)
    private readonly quoteRepository: IQuoteRepository,
  ) {}

  async createOrderFromQuote(
    command: CreateOrderFromQuoteCommand,
  ): Promise<OrderData> {
    const quote: QuoteEntity | null = await this.quoteRepository.findById(
      command.quoteId,
    );
    if (!isFound(quote)) {
      throw new HttpException(
        `Quote ${command.quoteId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const existingOrder: OrderEntity | null =
      await this.orderRepository.findByQuoteId(command.quoteId);
    if (isFound(existingOrder)) {
      throw new HttpException(
        `Order already exists for quote ${command.quoteId}`,
        HttpStatus.CONFLICT,
      );
    }

    const order: OrderEntity = OrderEntity.createFromQuote(
      quote.quoteId,
      quote.userId,
      quote.businessPartnerId ?? undefined,
    );

    const savedOrder: OrderEntity = await this.orderRepository.save(order);

    return this.mapEntityToData(savedOrder);
  }

  async getOrder(orderId: string): Promise<OrderData> {
    const order: OrderEntity | null =
      await this.orderRepository.findById(orderId);
    if (!isFound(order)) {
      throw new HttpException(
        `Order ${orderId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.mapEntityToData(order);
  }

  async getOrderByQuoteId(quoteId: string): Promise<OrderData | null> {
    const order: OrderEntity | null =
      await this.orderRepository.findByQuoteId(quoteId);

    return order ? this.mapEntityToData(order) : null;
  }

  async getOrdersForUser(userId: string): Promise<OrderData[]> {
    const orders: OrderEntity[] =
      await this.orderRepository.findByUserId(userId);

    return orders.map((order) => this.mapEntityToData(order));
  }

  async getOrdersByStatus(status: OrderStatus): Promise<OrderData[]> {
    const orders: OrderEntity[] =
      await this.orderRepository.findByStatus(status);

    return orders.map((order) => this.mapEntityToData(order));
  }

  async updateOrder(order: OrderEntity): Promise<OrderData> {
    const savedOrder: OrderEntity = await this.orderRepository.save(order);

    return this.mapEntityToData(savedOrder);
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
