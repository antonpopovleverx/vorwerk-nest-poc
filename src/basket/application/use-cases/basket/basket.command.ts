import { BasketPolicyCheckName } from 'src/basket/application/ports/policy-service.port.js';

export class BasketData {
  basketId: string;
  userId: string;
  items: Array<{
    itemId: string;
    amount: number;
  }>;
  bundles: Array<{
    bundleId: string;
    amount: number;
  }>;
}

export class AddItemCommand {
  userId!: string;
  itemId!: string;
  amount?: number;
}

export class UpdateItemCommand {
  userId!: string;
  itemId!: string;
  amount!: number;
}

export class RemoveItemCommand {
  userId!: string;
  itemId!: string;
}

export class AddBundleCommand {
  userId!: string;
  bundleId!: string;
  amount?: number;
}

export class UpdateBundleCommand {
  userId!: string;
  bundleId!: string;
  amount!: number;
}

export class RemoveBundleCommand {
  userId!: string;
  bundleId!: string;
}

export class BasketValidationResult {
  valid!: boolean;
  failedChecks!: Array<{
    checkName: BasketPolicyCheckName;
    message: string;
  }>;
}
