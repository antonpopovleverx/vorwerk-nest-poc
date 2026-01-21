import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IOrderRepository } from '../domain/order/order.repository';
import { OrderEntity } from '../domain/order/order.entity';
import { OrderStatus } from '../domain/order/order-status.enum';
import { Repository } from 'typeorm';

/**
 * TypeORM implementation of order repository
 */
@Injectable()
export class OrderRepositoryImplementation implements IOrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
  ) {}

  async findById(orderId: string): Promise<OrderEntity | null> {
    return this.repository.findOne({
      where: { orderId },
      relations: ['quote'],
    });
  }

  async findByQuoteId(quoteId: string): Promise<OrderEntity | null> {
    return this.repository.findOne({
      where: { quoteId },
      relations: ['quote'],
    });
  }

  async findByUserId(userId: string): Promise<OrderEntity[]> {
    return this.repository.find({
      where: { userId },
      relations: ['quote'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: OrderStatus): Promise<OrderEntity[]> {
    return this.repository.find({
      where: { status },
      relations: ['quote'],
      order: { createdAt: 'DESC' },
    });
  }

  async save(order: OrderEntity): Promise<OrderEntity> {
    return this.repository.save(order);
  }

  async delete(orderId: string): Promise<void> {
    await this.repository.delete({ orderId });
  }
}
