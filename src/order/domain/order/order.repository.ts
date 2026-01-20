import { OrderEntity } from './order.entity.js';
import { OrderStatus } from './order-status.enum.js';

/**
 * Order repository port
 */
export abstract class IOrderRepository {
  abstract findById(orderId: string): Promise<OrderEntity | null>;
  abstract findByQuoteId(quoteId: string): Promise<OrderEntity | null>;
  abstract findByUserId(userId: string): Promise<OrderEntity[]>;
  abstract findByStatus(status: OrderStatus): Promise<OrderEntity[]>;
  abstract save(order: OrderEntity): Promise<OrderEntity>;
  abstract delete(orderId: string): Promise<void>;
}
