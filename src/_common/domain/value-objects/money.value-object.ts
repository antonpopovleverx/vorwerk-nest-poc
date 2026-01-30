import { SupportedCurrency } from '../enums/currency.enum';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Money value object - immutable representation of monetary value
 */
export class Money {
  constructor(
    public readonly amount: number,
    public readonly SupportedCurrency: SupportedCurrency,
  ) {
    if (amount < 0) {
      throw new HttpException(
        'Money amount cannot be negative',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  add(other: Money): Money {
    this.assertSameSupportedCurrency(other);
    return new Money(this.amount + other.amount, this.SupportedCurrency);
  }

  subtract(other: Money): Money {
    this.assertSameSupportedCurrency(other);
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new HttpException(
        'Money subtraction would result in negative amount',
        HttpStatus.BAD_REQUEST,
      );
    }
    return new Money(result, this.SupportedCurrency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new HttpException(
        'Cannot multiply money by negative factor',
        HttpStatus.BAD_REQUEST,
      );
    }
    return new Money(
      Math.round(this.amount * factor * 100) / 100,
      this.SupportedCurrency,
    );
  }

  applyDiscount(discountRate: number): Money {
    if (discountRate < 0 || discountRate > 1) {
      throw new HttpException(
        'Discount rate must be between 0 and 1',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.multiply(1 - discountRate);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.SupportedCurrency === other.SupportedCurrency;
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameSupportedCurrency(other);
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    this.assertSameSupportedCurrency(other);
    return this.amount < other.amount;
  }

  private assertSameSupportedCurrency(other: Money): void {
    if (this.SupportedCurrency !== other.SupportedCurrency) {
      throw new HttpException(
        `SupportedCurrency mismatch: ${this.SupportedCurrency} vs ${other.SupportedCurrency}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  static zero(SupportedCurrency: SupportedCurrency): Money {
    return new Money(0, SupportedCurrency);
  }

  toJSON() {
    return {
      amount: this.amount,
      SupportedCurrency: this.SupportedCurrency,
    };
  }

  static fromJSON(json: { amount: number; SupportedCurrency: SupportedCurrency }): Money {
    return new Money(json.amount, json.SupportedCurrency);
  }
}
