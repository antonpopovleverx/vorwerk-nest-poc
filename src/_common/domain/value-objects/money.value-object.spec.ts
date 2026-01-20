import { Money } from './money.value-object.js';
import { Currency } from '../enums/currency.enum.js';

describe('Money', () => {
  describe('constructor', () => {
    it('should create a money object with amount and currency', () => {
      const money = new Money(100.5, Currency.EUR);

      expect(money.amount).toBe(100.5);
      expect(money.currency).toBe(Currency.EUR);
    });

    it('should throw error for negative amount', () => {
      expect(() => new Money(-10, Currency.EUR)).toThrow(
        'Money amount cannot be negative',
      );
    });
  });

  describe('add', () => {
    it('should add two money objects with same currency', () => {
      const money1 = new Money(100, Currency.EUR);
      const money2 = new Money(50, Currency.EUR);

      const result = money1.add(money2);

      expect(result.amount).toBe(150);
      expect(result.currency).toBe(Currency.EUR);
    });

    it('should throw error for different currencies', () => {
      const money1 = new Money(100, Currency.EUR);
      const money2 = new Money(50, Currency.USD);

      expect(() => money1.add(money2)).toThrow('Currency mismatch');
    });
  });

  describe('subtract', () => {
    it('should subtract money objects with same currency', () => {
      const money1 = new Money(100, Currency.EUR);
      const money2 = new Money(30, Currency.EUR);

      const result = money1.subtract(money2);

      expect(result.amount).toBe(70);
    });

    it('should throw error if result would be negative', () => {
      const money1 = new Money(50, Currency.EUR);
      const money2 = new Money(100, Currency.EUR);

      expect(() => money1.subtract(money2)).toThrow('negative amount');
    });
  });

  describe('multiply', () => {
    it('should multiply money by a factor', () => {
      const money = new Money(100, Currency.EUR);
      const result = money.multiply(2.5);

      expect(result.amount).toBe(250);
    });

    it('should round to 2 decimal places', () => {
      const money = new Money(100, Currency.EUR);
      const result = money.multiply(0.333);

      expect(result.amount).toBe(33.3);
    });

    it('should throw error for negative factor', () => {
      const money = new Money(100, Currency.EUR);
      expect(() => money.multiply(-1)).toThrow('negative factor');
    });
  });

  describe('applyDiscount', () => {
    it('should apply discount rate', () => {
      const money = new Money(100, Currency.EUR);
      const result = money.applyDiscount(0.2); // 20% off

      expect(result.amount).toBe(80);
    });

    it('should throw error for invalid discount rate', () => {
      const money = new Money(100, Currency.EUR);

      expect(() => money.applyDiscount(-0.1)).toThrow('between 0 and 1');
      expect(() => money.applyDiscount(1.5)).toThrow('between 0 and 1');
    });
  });

  describe('equals', () => {
    it('should return true for equal money objects', () => {
      const money1 = new Money(100, Currency.EUR);
      const money2 = new Money(100, Currency.EUR);

      expect(money1.equals(money2)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const money1 = new Money(100, Currency.EUR);
      const money2 = new Money(200, Currency.EUR);

      expect(money1.equals(money2)).toBe(false);
    });

    it('should return false for different currencies', () => {
      const money1 = new Money(100, Currency.EUR);
      const money2 = new Money(100, Currency.USD);

      expect(money1.equals(money2)).toBe(false);
    });
  });

  describe('comparison', () => {
    it('isGreaterThan should work correctly', () => {
      const money1 = new Money(100, Currency.EUR);
      const money2 = new Money(50, Currency.EUR);

      expect(money1.isGreaterThan(money2)).toBe(true);
      expect(money2.isGreaterThan(money1)).toBe(false);
    });

    it('isLessThan should work correctly', () => {
      const money1 = new Money(50, Currency.EUR);
      const money2 = new Money(100, Currency.EUR);

      expect(money1.isLessThan(money2)).toBe(true);
      expect(money2.isLessThan(money1)).toBe(false);
    });
  });

  describe('zero', () => {
    it('should create a zero money object', () => {
      const zero = Money.zero(Currency.EUR);

      expect(zero.amount).toBe(0);
      expect(zero.currency).toBe(Currency.EUR);
    });
  });

  describe('JSON serialization', () => {
    it('should serialize to JSON', () => {
      const money = new Money(100.5, Currency.EUR);
      const json = money.toJSON();

      expect(json).toEqual({ amount: 100.5, currency: Currency.EUR });
    });

    it('should deserialize from JSON', () => {
      const money = Money.fromJSON({ amount: 100.5, currency: Currency.EUR });

      expect(money.amount).toBe(100.5);
      expect(money.currency).toBe(Currency.EUR);
    });
  });
});
