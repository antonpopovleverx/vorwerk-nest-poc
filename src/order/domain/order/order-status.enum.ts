
export enum OrderStatus {
  INITIALIZED = 'INITIALIZED',
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  DELIVERY_INITIATED = 'DELIVERY_INITIATED',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

/**
 * Valid state transitions for order status
 */
export const OrderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.INITIALIZED]: [
    OrderStatus.PAYMENT_INITIATED,
    OrderStatus.FAILED,
  ],
  [OrderStatus.PAYMENT_INITIATED]: [
    OrderStatus.DELIVERY_INITIATED,
    OrderStatus.FAILED,
  ],
  [OrderStatus.DELIVERY_INITIATED]: [OrderStatus.DELIVERED, OrderStatus.FAILED],
  [OrderStatus.DELIVERED]: [], // Terminal state
  [OrderStatus.FAILED]: [], // Terminal state
};

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return OrderStatusTransitions[from].includes(to);
}
