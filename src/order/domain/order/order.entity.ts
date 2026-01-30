import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { TechnicalEntity } from '../../../_common/domain/base/base.entity';
import { OrderStatus, isValidTransition } from './order-status.enum';
import { QuoteEntity } from '../quote/quote.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

@Entity('orders')
export class OrderEntity extends TechnicalEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'order_id' })
  orderId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'quote_id' })
  quoteId: string;

  @Column({ name: 'business_partner_id', type: 'varchar', nullable: true })
  businessPartnerId: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: OrderStatus.INITIALIZED,
  })
  status: OrderStatus;

  @Column({ name: 'payment_reference', type: 'varchar', nullable: true })
  paymentReference: string | null;

  @Column({ name: 'delivery_reference', type: 'varchar', nullable: true })
  deliveryReference: string | null;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string | null;

  @OneToOne(() => QuoteEntity)
  @JoinColumn({ name: 'quote_id' })
  quote: QuoteEntity;

  
  canTransitionTo(newStatus: OrderStatus): boolean {
    return isValidTransition(this.status, newStatus);
  }

  private transitionTo(newStatus: OrderStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new HttpException(
        `Invalid status transition from ${this.status} to ${newStatus}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    this.status = newStatus;
  }

  initiatePayment(paymentReference: string): void {
    this.transitionTo(OrderStatus.PAYMENT_INITIATED);
    this.paymentReference = paymentReference;
  }

  initiateDelivery(deliveryReference: string): void {
    this.transitionTo(OrderStatus.DELIVERY_INITIATED);
    this.deliveryReference = deliveryReference;
  }

  markDelivered(): void {
    this.transitionTo(OrderStatus.DELIVERED);
  }

  markFailed(reason: string): void {
    this.transitionTo(OrderStatus.FAILED);
    this.failureReason = reason;
  }

  isTerminal(): boolean {
    return (
      this.status === OrderStatus.DELIVERED ||
      this.status === OrderStatus.FAILED
    );
  }

  isCompleted(): boolean {
    return this.status === OrderStatus.DELIVERED;
  }

  isFailed(): boolean {
    return this.status === OrderStatus.FAILED;
  }

  static createFromQuote(
    quoteId: string,
    userId: string,
    businessPartnerId?: string,
  ): OrderEntity {
    const order = new OrderEntity();
    order.quoteId = quoteId;
    order.userId = userId;
    order.businessPartnerId = businessPartnerId ?? null;
    order.status = OrderStatus.INITIALIZED;
    order.paymentReference = null;
    order.deliveryReference = null;
    order.failureReason = null;
    return order;
  }
}
