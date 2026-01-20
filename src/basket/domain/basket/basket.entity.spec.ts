import { BasketEntity } from './basket.entity.js';

describe('BasketEntity', () => {
  let basket: BasketEntity;

  beforeEach(() => {
    basket = BasketEntity.createForUser('user-123');
    basket.basketId = 'basket-123';
  });

  describe('createForUser', () => {
    it('should create a basket with empty items and bundles', () => {
      expect(basket.userId).toBe('user-123');
      expect(basket.items).toEqual([]);
      expect(basket.bundles).toEqual([]);
    });
  });

  describe('addItem', () => {
    it('should add a new item to the basket', () => {
      basket.addItem('ITEM-001', 2);

      expect(basket.items.length).toBe(1);
      expect(basket.items[0].itemId).toBe('ITEM-001');
      expect(basket.items[0].amount).toBe(2);
    });

    it('should increase amount if item already exists', () => {
      basket.addItem('ITEM-001', 2);
      basket.addItem('ITEM-001', 3);

      expect(basket.items.length).toBe(1);
      expect(basket.items[0].amount).toBe(5);
    });

    it('should throw error for non-positive amount', () => {
      expect(() => basket.addItem('ITEM-001', 0)).toThrow(
        'Amount must be positive',
      );
      expect(() => basket.addItem('ITEM-001', -1)).toThrow(
        'Amount must be positive',
      );
    });
  });

  describe('removeItem', () => {
    it('should remove an existing item', () => {
      basket.addItem('ITEM-001', 2);
      basket.addItem('ITEM-002', 1);

      basket.removeItem('ITEM-001');

      expect(basket.items.length).toBe(1);
      expect(basket.items[0].itemId).toBe('ITEM-002');
    });

    it('should do nothing if item does not exist', () => {
      basket.addItem('ITEM-001', 2);
      basket.removeItem('ITEM-999');

      expect(basket.items.length).toBe(1);
    });
  });

  describe('updateItemAmount', () => {
    it('should update item amount', () => {
      basket.addItem('ITEM-001', 2);
      basket.updateItemAmount('ITEM-001', 5);

      expect(basket.items[0].amount).toBe(5);
    });

    it('should remove item if amount is 0 or negative', () => {
      basket.addItem('ITEM-001', 2);
      basket.updateItemAmount('ITEM-001', 0);

      expect(basket.items.length).toBe(0);
    });

    it('should throw error if item not found', () => {
      expect(() => basket.updateItemAmount('ITEM-999', 5)).toThrow(
        'Item ITEM-999 not found in basket',
      );
    });
  });

  describe('addBundle', () => {
    it('should add a new bundle to the basket', () => {
      basket.addBundle('BUNDLE-001', 1);

      expect(basket.bundles.length).toBe(1);
      expect(basket.bundles[0].bundleId).toBe('BUNDLE-001');
      expect(basket.bundles[0].amount).toBe(1);
    });

    it('should increase amount if bundle already exists', () => {
      basket.addBundle('BUNDLE-001', 1);
      basket.addBundle('BUNDLE-001', 2);

      expect(basket.bundles.length).toBe(1);
      expect(basket.bundles[0].amount).toBe(3);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty basket', () => {
      expect(basket.isEmpty()).toBe(true);
    });

    it('should return false when basket has items', () => {
      basket.addItem('ITEM-001', 1);
      expect(basket.isEmpty()).toBe(false);
    });

    it('should return false when basket has bundles', () => {
      basket.addBundle('BUNDLE-001', 1);
      expect(basket.isEmpty()).toBe(false);
    });
  });

  describe('getTotalItemCount', () => {
    it('should return sum of all item amounts', () => {
      basket.addItem('ITEM-001', 2);
      basket.addItem('ITEM-002', 3);

      expect(basket.getTotalItemCount()).toBe(5);
    });

    it('should return 0 for empty basket', () => {
      expect(basket.getTotalItemCount()).toBe(0);
    });
  });

  describe('getTotalBundleCount', () => {
    it('should return sum of all bundle amounts', () => {
      basket.addBundle('BUNDLE-001', 2);
      basket.addBundle('BUNDLE-002', 1);

      expect(basket.getTotalBundleCount()).toBe(3);
    });
  });

  describe('clear', () => {
    it('should remove all items and bundles', () => {
      basket.addItem('ITEM-001', 2);
      basket.addBundle('BUNDLE-001', 1);

      basket.clear();

      expect(basket.items.length).toBe(0);
      expect(basket.bundles.length).toBe(0);
      expect(basket.isEmpty()).toBe(true);
    });
  });

  describe('createSnapshot', () => {
    it('should create a snapshot of basket contents', () => {
      basket.addItem('ITEM-001', 2);
      basket.addBundle('BUNDLE-001', 1);

      const snapshot = basket.createSnapshot();

      expect(snapshot.basketId).toBe('basket-123');
      expect(snapshot.userId).toBe('user-123');
      expect(snapshot.items).toEqual([{ itemId: 'ITEM-001', amount: 2 }]);
      expect(snapshot.bundles).toEqual([{ bundleId: 'BUNDLE-001', amount: 1 }]);
      expect(snapshot.snapshotAt).toBeInstanceOf(Date);
    });
  });
});
