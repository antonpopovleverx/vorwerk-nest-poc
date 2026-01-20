import { OrderEntity } from './order.entity.js';
import { OrderStatus } from './order-status.enum.js';

describe('OrderEntity', () => {
  let order: OrderEntity;

  beforeEach(() => {
    order = OrderEntity.createFromQuote('quote-123', 'user-123', 'bp-123');
  });

  describe('createFromQuote', () => {
    it('should create an order with INITIALIZED status', () => {
      expect(order.quoteId).toBe('quote-123');
      expect(order.userId).toBe('user-123');
      expect(order.businessPartnerId).toBe('bp-123');
      expect(order.status).toBe(OrderStatus.INITIALIZED);
      expect(order.paymentReference).toBeNull();
      expect(order.deliveryReference).toBeNull();
      expect(order.failureReason).toBeNull();
    });

    it('should handle optional businessPartnerId', () => {
      const orderWithoutBP = OrderEntity.createFromQuote(
        'quote-123',
        'user-123',
      );
      expect(orderWithoutBP.businessPartnerId).toBeNull();
    });
  });

  describe('state transitions', () => {
    describe('initiatePayment', () => {
      it('should transition from INITIALIZED to PAYMENT_INITIATED', () => {
        order.initiatePayment('PAY-123');

        expect(order.status).toBe(OrderStatus.PAYMENT_INITIATED);
        expect(order.paymentReference).toBe('PAY-123');
      });

      it('should throw error for invalid transition', () => {
        order.initiatePayment('PAY-123');
        expect(() => order.initiatePayment('PAY-456')).toThrow(
          'Invalid status transition',
        );
      });
    });

    describe('initiateDelivery', () => {
      it('should transition from PAYMENT_INITIATED to DELIVERY_INITIATED', () => {
        order.initiatePayment('PAY-123');
        order.initiateDelivery('DEL-123');

        expect(order.status).toBe(OrderStatus.DELIVERY_INITIATED);
        expect(order.deliveryReference).toBe('DEL-123');
      });

      it('should throw error if not in PAYMENT_INITIATED state', () => {
        expect(() => order.initiateDelivery('DEL-123')).toThrow(
          'Invalid status transition',
        );
      });
    });

    describe('markDelivered', () => {
      it('should transition from DELIVERY_INITIATED to DELIVERED', () => {
        order.initiatePayment('PAY-123');
        order.initiateDelivery('DEL-123');
        order.markDelivered();

        expect(order.status).toBe(OrderStatus.DELIVERED);
      });
    });

    describe('markFailed', () => {
      it('should transition to FAILED from any non-terminal state', () => {
        order.markFailed('Test failure');

        expect(order.status).toBe(OrderStatus.FAILED);
        expect(order.failureReason).toBe('Test failure');
      });

      it('should work from PAYMENT_INITIATED state', () => {
        order.initiatePayment('PAY-123');
        order.markFailed('Payment timeout');

        expect(order.status).toBe(OrderStatus.FAILED);
      });

      it('should work from DELIVERY_INITIATED state', () => {
        order.initiatePayment('PAY-123');
        order.initiateDelivery('DEL-123');
        order.markFailed('Delivery failed');

        expect(order.status).toBe(OrderStatus.FAILED);
      });
    });
  });

  describe('canTransitionTo', () => {
    it('should return true for valid transitions', () => {
      expect(order.canTransitionTo(OrderStatus.PAYMENT_INITIATED)).toBe(true);
      expect(order.canTransitionTo(OrderStatus.FAILED)).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(order.canTransitionTo(OrderStatus.DELIVERY_INITIATED)).toBe(false);
      expect(order.canTransitionTo(OrderStatus.DELIVERED)).toBe(false);
    });
  });

  describe('isTerminal', () => {
    it('should return false for non-terminal states', () => {
      expect(order.isTerminal()).toBe(false);

      order.initiatePayment('PAY-123');
      expect(order.isTerminal()).toBe(false);

      order.initiateDelivery('DEL-123');
      expect(order.isTerminal()).toBe(false);
    });

    it('should return true for DELIVERED', () => {
      order.initiatePayment('PAY-123');
      order.initiateDelivery('DEL-123');
      order.markDelivered();

      expect(order.isTerminal()).toBe(true);
    });

    it('should return true for FAILED', () => {
      order.markFailed('Failed');
      expect(order.isTerminal()).toBe(true);
    });
  });

  describe('isCompleted', () => {
    it('should return true only for DELIVERED status', () => {
      expect(order.isCompleted()).toBe(false);

      order.initiatePayment('PAY-123');
      order.initiateDelivery('DEL-123');
      order.markDelivered();

      expect(order.isCompleted()).toBe(true);
    });
  });

  describe('isFailed', () => {
    it('should return true only for FAILED status', () => {
      expect(order.isFailed()).toBe(false);

      order.markFailed('Failed');
      expect(order.isFailed()).toBe(true);
    });
  });
});
