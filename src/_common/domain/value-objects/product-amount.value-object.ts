import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * ProductAmount value object - immutable representation of discrete product quantity
 */
export class ProductAmount {
  constructor(public readonly value: number) {
    if (!Number.isInteger(value)) {
      throw new HttpException(
        'Product amount must be an integer',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (value < 0) {
      throw new HttpException(
        'Product amount cannot be negative',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  add(other: ProductAmount): ProductAmount {
    return new ProductAmount(this.value + other.value);
  }

  subtract(other: ProductAmount): ProductAmount {
    const result = this.value - other.value;
    if (result < 0) {
      throw new HttpException(
        'Product amount subtraction would result in negative amount',
        HttpStatus.BAD_REQUEST,
      );
    }
    return new ProductAmount(result);
  }

  multiply(factor: number): ProductAmount {
    if (!Number.isInteger(factor)) {
      throw new HttpException(
        'Multiplication factor must be an integer',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (factor < 0) {
      throw new HttpException(
        'Cannot multiply product amount by negative factor',
        HttpStatus.BAD_REQUEST,
      );
    }
    return new ProductAmount(this.value * factor);
  }

  divide(divisor: number): ProductAmount {
    if (!Number.isInteger(divisor)) {
      throw new HttpException(
        'Division divisor must be an integer',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (divisor <= 0) {
      throw new HttpException(
        'Cannot divide product amount by zero or negative number',
        HttpStatus.BAD_REQUEST,
      );
    }
    const result = this.value / divisor;
    if (!Number.isInteger(result)) {
      throw new HttpException(
        'Division result must be an integer',
        HttpStatus.BAD_REQUEST,
      );
    }
    return new ProductAmount(result);
  }

  equals(other: ProductAmount): boolean {
    return this.value === other.value;
  }

  isGreaterThan(other: ProductAmount): boolean {
    return this.value > other.value;
  }

  isLessThan(other: ProductAmount): boolean {
    return this.value < other.value;
  }

  isGreaterThanOrEqual(other: ProductAmount): boolean {
    return this.value >= other.value;
  }

  isLessThanOrEqual(other: ProductAmount): boolean {
    return this.value <= other.value;
  }

  isZero(): boolean {
    return this.value === 0;
  }

  static zero(): ProductAmount {
    return new ProductAmount(0);
  }

  static one(): ProductAmount {
    return new ProductAmount(1);
  }

  toJSON(): number {
    return this.value;
  }

  static fromJSON(value: number): ProductAmount {
    return new ProductAmount(value);
  }
}
