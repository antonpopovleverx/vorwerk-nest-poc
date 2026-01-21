import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  IPaymentServicePort,
  PaymentRequest,
  PaymentResult,
  RefundRequest,
} from '../../application/ports/payment-service.port';

/**
 * Mock payment service for POC
 * Simulates payment processing with configurable failure rate
 */
@Injectable()
export class PaymentServiceMock implements IPaymentServicePort {
  private readonly logger = new Logger(PaymentServiceMock.name);
  private failureRate = 0; // Set to 0-1 to simulate failures

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    this.logger.log(
      `Processing payment for order ${request.orderId}: ${request.amount} ${request.currency}`,
    );

    // Simulate processing delay
    await this.delay(100);

    // Simulate random failures
    if (Math.random() < this.failureRate) {
      this.logger.warn(`Payment failed for order ${request.orderId}`);
      return {
        success: false,
        error: 'Payment processing failed (simulated)',
      };
    }

    const paymentReference = `PAY-${uuidv4().substring(0, 8).toUpperCase()}`;
    this.logger.log(
      `Payment successful: ${paymentReference} for order ${request.orderId}`,
    );

    return {
      success: true,
      paymentReference,
    };
  }

  async refundPayment(request: RefundRequest): Promise<{ success: boolean }> {
    this.logger.log(
      `Refunding payment ${request.paymentReference}: ${request.amount} - Reason: ${request.reason}`,
    );

    // Simulate processing delay
    await this.delay(50);

    this.logger.log(`Refund successful for ${request.paymentReference}`);
    return { success: true };
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
