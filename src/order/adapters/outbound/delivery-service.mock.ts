import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  DeliveryServicePort,
  DeliveryRequest,
  DeliveryResult,
  CancelDeliveryRequest,
} from '../../application/ports/delivery-service.port';

/**
 * Mock delivery service for POC
 * Simulates delivery processing with configurable failure rate
 */
@Injectable()
export class DeliveryServiceMock implements DeliveryServicePort {
  private readonly logger = new Logger(DeliveryServiceMock.name);
  private failureRate = 0; // Set to 0-1 to simulate failures
  private readonly deliveryStatuses = new Map<
    string,
    { status: string; delivered: boolean }
  >();

  async initiateDelivery(request: DeliveryRequest): Promise<DeliveryResult> {
    this.logger.log(
      `Initiating delivery for order ${request.orderId}: ${request.items.length} items, ${request.bundles.length} bundles`,
    );

    // Simulate processing delay
    await this.delay(100);

    // Simulate random failures
    if (Math.random() < this.failureRate) {
      this.logger.warn(
        `Delivery initiation failed for order ${request.orderId}`,
      );
      return {
        success: false,
        error: 'Delivery service unavailable (simulated)',
      };
    }

    const deliveryReference = `DEL-${uuidv4().substring(0, 8).toUpperCase()}`;
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 3); // 3 days from now

    // Store delivery status
    this.deliveryStatuses.set(deliveryReference, {
      status: 'DELIVERED', // For POC, immediately delivered
      delivered: true,
    });

    this.logger.log(
      `Delivery initiated: ${deliveryReference} for order ${request.orderId}`,
    );

    return {
      success: true,
      deliveryReference,
      estimatedDeliveryDate,
    };
  }

  async cancelDelivery(
    request: CancelDeliveryRequest,
  ): Promise<{ success: boolean }> {
    this.logger.log(
      `Cancelling delivery ${request.deliveryReference}: ${request.reason}`,
    );

    // Simulate processing delay
    await this.delay(50);

    this.deliveryStatuses.delete(request.deliveryReference);
    this.logger.log(`Delivery cancelled: ${request.deliveryReference}`);

    return { success: true };
  }

  async checkDeliveryStatus(
    deliveryReference: string,
  ): Promise<{ status: string; delivered: boolean }> {
    const status = this.deliveryStatuses.get(deliveryReference);

    if (!status) {
      return { status: 'UNKNOWN', delivered: false };
    }

    return status;
  }

  /**
   * Set failure rate for testing (0-1)
   */
  setFailureRate(rate: number): void {
    this.failureRate = Math.max(0, Math.min(1, rate));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
