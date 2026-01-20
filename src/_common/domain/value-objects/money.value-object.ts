import { Currency } from '@common/domain/enums/currency.enum.js';

/**
 * Money value object - immutable representation of monetary value
 */
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: Currency,
  ) {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error('Money subtraction would result in negative amount');
    }
    return new Money(result, this.currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Cannot multiply money by negative factor');
    }
    return new Money(
      Math.round(this.amount * factor * 100) / 100,
      this.currency,
    );
  }

  applyDiscount(discountRate: number): Money {
    if (discountRate < 0 || discountRate > 1) {
      throw new Error('Discount rate must be between 0 and 1');
    }
    return this.multiply(1 - discountRate);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount < other.amount;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Currency mismatch: ${this.currency} vs ${other.currency}`,
      );
    }
  }

  static zero(currency: Currency): Money {
    return new Money(0, currency);
  }

  toJSON() {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  static fromJSON(json: { amount: number; currency: Currency }): Money {
    return new Money(json.amount, json.currency);
  }
}
