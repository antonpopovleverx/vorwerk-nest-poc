import { BundleEntity } from './bundle.entity';
import { Money } from '../../../_common/domain/value-objects/money.value-object';
import { SupportedCurrency } from '../../../_common/domain/enums/currency.enum';
import { ProductAmount } from '../../../_common/domain/value-objects/product-amount.value-object';

describe('BundleEntity', () => {
  let bundle: BundleEntity;

  beforeEach(() => {
    bundle = BundleEntity.create(
      'Test Bundle',
      'A test bundle',
      new Money(100, SupportedCurrency.EUR),
      0.2,
    );
    bundle.bundleId = 'bundle-123';
  });

  describe('create', () => {
    it('should create a bundle with correct properties', () => {
      expect(bundle.name).toBe('Test Bundle');
      expect(bundle.description).toBe('A test bundle');
      expect(bundle.basePrice.amount).toBe(100);
      expect(bundle.basePrice.SupportedCurrency).toBe(SupportedCurrency.EUR);
      expect(bundle.discountRate).toBe(0.2);
      expect(bundle.isActive).toBe(true);
      expect(bundle.contents).toEqual([]);
    });

    it('should throw error for invalid discount rate', () => {
      const money = new Money(100, SupportedCurrency.EUR);
      expect(() => BundleEntity.create('Test', '', money, -0.1)).toThrow();
      expect(() => BundleEntity.create('Test', '', money, 1)).toThrow();
      expect(() => BundleEntity.create('Test', '', money, 1.5)).toThrow();
    });
  });

  describe('getDiscountedPrice', () => {
    it('should calculate discounted price correctly', () => {
      expect(bundle.getDiscountedPrice().amount).toBe(80);
      expect(bundle.getDiscountedPrice().SupportedCurrency).toBe(SupportedCurrency.EUR);
    });

    it('should round to 2 decimal places', () => {
      bundle.basePrice = new Money(99.99, SupportedCurrency.EUR);
      bundle.discountRate = 0.15;
      expect(bundle.getDiscountedPrice().amount).toBe(84.99);
      expect(bundle.getDiscountedPrice().SupportedCurrency).toBe(SupportedCurrency.EUR);
    });
  });

  describe('getDiscountAmount', () => {
    it('should calculate discount amount correctly', () => {
      expect(bundle.getDiscountAmount().amount).toBe(20);
      expect(bundle.getDiscountAmount().SupportedCurrency).toBe(SupportedCurrency.EUR);
    });
  });

  describe('addItem', () => {
    it('should add a new item to contents', () => {
      bundle.addItem('ITEM-001', new ProductAmount(2));

      expect(bundle.contents.length).toBe(1);
      expect(bundle.contents[0].itemId).toBe('ITEM-001');
      expect(bundle.contents[0].amount.value).toBe(2);
    });

    it('should increase quantity if item already exists', () => {
      bundle.addItem('ITEM-001', new ProductAmount(2));
      bundle.addItem('ITEM-001', new ProductAmount(3));

      expect(bundle.contents.length).toBe(1);
      expect(bundle.contents[0].amount.value).toBe(5);
    });

    it('should throw error for non-positive quantity', () => {
      expect(() => bundle.addItem('ITEM-001', ProductAmount.zero())).toThrow(
        'Quantity must be positive',
      );
    });
  });

  describe('removeItem', () => {
    it('should remove an existing item', () => {
      bundle.addItem('ITEM-001', new ProductAmount(2));
      bundle.addItem('ITEM-002', new ProductAmount(1));

      bundle.removeItem('ITEM-001');

      expect(bundle.contents.length).toBe(1);
      expect(bundle.contents[0].itemId).toBe('ITEM-002');
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity', () => {
      bundle.addItem('ITEM-001', new ProductAmount(2));
      bundle.updateItemQuantity('ITEM-001', new ProductAmount(5));

      expect(bundle.contents[0].amount.value).toBe(5);
    });

    it('should remove item if quantity is 0', () => {
      bundle.addItem('ITEM-001', new ProductAmount(2));
      bundle.updateItemQuantity('ITEM-001', ProductAmount.zero());

      expect(bundle.contents.length).toBe(0);
    });

    it('should throw error if item not found', () => {
      expect(() =>
        bundle.updateItemQuantity('ITEM-999', new ProductAmount(5)),
      ).toThrow('not found in bundle');
    });
  });

  describe('setDiscountRate', () => {
    it('should update discount rate', () => {
      bundle.setDiscountRate(0.3);
      expect(bundle.discountRate).toBe(0.3);
    });

    it('should throw error for invalid rate', () => {
      expect(() => bundle.setDiscountRate(-0.1)).toThrow();
      expect(() => bundle.setDiscountRate(1)).toThrow();
    });
  });

  describe('activate/deactivate', () => {
    it('should activate bundle', () => {
      bundle.isActive = false;
      bundle.activate();
      expect(bundle.isActive).toBe(true);
    });

    it('should deactivate bundle', () => {
      bundle.deactivate();
      expect(bundle.isActive).toBe(false);
    });
  });

  describe('getItemIds', () => {
    it('should return all item IDs', () => {
      bundle.addItem('ITEM-001', new ProductAmount(2));
      bundle.addItem('ITEM-002', new ProductAmount(1));
      bundle.addItem('ITEM-003', new ProductAmount(3));

      const itemIds = bundle.getItemIds();

      expect(itemIds).toEqual(['ITEM-001', 'ITEM-002', 'ITEM-003']);
    });

    it('should return empty array for empty bundle', () => {
      expect(bundle.getItemIds()).toEqual([]);
    });
  });
});
