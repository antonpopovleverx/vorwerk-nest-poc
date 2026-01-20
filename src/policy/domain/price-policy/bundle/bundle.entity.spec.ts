import { BundleEntity } from './bundle.entity.js';

describe('BundleEntity', () => {
  let bundle: BundleEntity;

  beforeEach(() => {
    bundle = BundleEntity.create(
      'Test Bundle',
      'A test bundle',
      100,
      0.2, // 20% discount
    );
    bundle.bundleId = 'bundle-123';
  });

  describe('create', () => {
    it('should create a bundle with correct properties', () => {
      expect(bundle.name).toBe('Test Bundle');
      expect(bundle.description).toBe('A test bundle');
      expect(bundle.basePrice).toBe(100);
      expect(bundle.discountRate).toBe(0.2);
      expect(bundle.isActive).toBe(true);
      expect(bundle.contents).toEqual([]);
    });

    it('should throw error for invalid discount rate', () => {
      expect(() => BundleEntity.create('Test', '', 100, -0.1)).toThrow();
      expect(() => BundleEntity.create('Test', '', 100, 1)).toThrow();
      expect(() => BundleEntity.create('Test', '', 100, 1.5)).toThrow();
    });
  });

  describe('getDiscountedPrice', () => {
    it('should calculate discounted price correctly', () => {
      expect(bundle.getDiscountedPrice()).toBe(80); // 100 * (1 - 0.2)
    });

    it('should round to 2 decimal places', () => {
      bundle.basePrice = 99.99;
      bundle.discountRate = 0.15;
      expect(bundle.getDiscountedPrice()).toBe(84.99); // 99.99 * 0.85 = 84.9915 -> 84.99
    });
  });

  describe('getDiscountAmount', () => {
    it('should calculate discount amount correctly', () => {
      expect(bundle.getDiscountAmount()).toBe(20); // 100 * 0.2
    });
  });

  describe('addItem', () => {
    it('should add a new item to contents', () => {
      bundle.addItem('ITEM-001', 2);

      expect(bundle.contents.length).toBe(1);
      expect(bundle.contents[0].itemId).toBe('ITEM-001');
      expect(bundle.contents[0].quantity).toBe(2);
    });

    it('should increase quantity if item already exists', () => {
      bundle.addItem('ITEM-001', 2);
      bundle.addItem('ITEM-001', 3);

      expect(bundle.contents.length).toBe(1);
      expect(bundle.contents[0].quantity).toBe(5);
    });

    it('should throw error for non-positive quantity', () => {
      expect(() => bundle.addItem('ITEM-001', 0)).toThrow(
        'Quantity must be positive',
      );
      expect(() => bundle.addItem('ITEM-001', -1)).toThrow(
        'Quantity must be positive',
      );
    });
  });

  describe('removeItem', () => {
    it('should remove an existing item', () => {
      bundle.addItem('ITEM-001', 2);
      bundle.addItem('ITEM-002', 1);

      bundle.removeItem('ITEM-001');

      expect(bundle.contents.length).toBe(1);
      expect(bundle.contents[0].itemId).toBe('ITEM-002');
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity', () => {
      bundle.addItem('ITEM-001', 2);
      bundle.updateItemQuantity('ITEM-001', 5);

      expect(bundle.contents[0].quantity).toBe(5);
    });

    it('should remove item if quantity is 0', () => {
      bundle.addItem('ITEM-001', 2);
      bundle.updateItemQuantity('ITEM-001', 0);

      expect(bundle.contents.length).toBe(0);
    });

    it('should throw error if item not found', () => {
      expect(() => bundle.updateItemQuantity('ITEM-999', 5)).toThrow(
        'not found in bundle',
      );
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
      bundle.addItem('ITEM-001', 2);
      bundle.addItem('ITEM-002', 1);
      bundle.addItem('ITEM-003', 3);

      const itemIds = bundle.getItemIds();

      expect(itemIds).toEqual(['ITEM-001', 'ITEM-002', 'ITEM-003']);
    });

    it('should return empty array for empty bundle', () => {
      expect(bundle.getItemIds()).toEqual([]);
    });
  });
});
