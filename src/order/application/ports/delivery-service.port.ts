export class DeliveryRequest {
  orderId!: string;
  userId!: string;
  items!: Array<{ itemId: string; amount: number }>;
  bundles!: Array<{ bundleId: string; amount: number }>;
}

export class DeliveryResult {
  success!: boolean;
  deliveryReference?: string;
  estimatedDeliveryDate?: Date;
  error?: string;
}

export class CancelDeliveryRequest {
  deliveryReference!: string;
  reason!: string;
}

export abstract class DeliveryServicePort {
  abstract initiateDelivery(request: DeliveryRequest): Promise<DeliveryResult>;

  abstract cancelDelivery(
    request: CancelDeliveryRequest,
  ): Promise<{ success: boolean }>;

  abstract checkDeliveryStatus(
    deliveryReference: string,
  ): Promise<{ status: string; delivered: boolean }>;
}
