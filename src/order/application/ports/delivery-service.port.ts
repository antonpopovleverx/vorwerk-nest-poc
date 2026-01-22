/**
 * Delivery request
 */
export class DeliveryRequest {
  orderId!: string;
  userId!: string;
  items!: Array<{ itemId: string; amount: number }>;
  bundles!: Array<{ bundleId: string; amount: number }>;
}

/**
 * Delivery result
 */
export class DeliveryResult {
  success!: boolean;
  deliveryReference?: string;
  estimatedDeliveryDate?: Date;
  error?: string;
}

/**
 * Cancel delivery request
 */
export class CancelDeliveryRequest {
  deliveryReference!: string;
  reason!: string;
}

/**
 * Port for delivery service (external microservice mock)
 */
export abstract class DeliveryServicePort {
  /**
   * Initiate delivery
   */
  abstract initiateDelivery(request: DeliveryRequest): Promise<DeliveryResult>;

  /**
   * Cancel delivery (compensatory action)
   */
  abstract cancelDelivery(
    request: CancelDeliveryRequest,
  ): Promise<{ success: boolean }>;

  /**
   * Check delivery status
   */
  abstract checkDeliveryStatus(
    deliveryReference: string,
  ): Promise<{ status: string; delivered: boolean }>;
}
