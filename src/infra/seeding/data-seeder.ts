import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Currency } from 'src/_common/domain/enums/currency.enum';
import { Region } from 'src/_common/domain/enums/region.enum';
import { Money } from 'src/_common/domain/value-objects/money.value-object';
import { BundleEntity } from 'src/policy/domain/price-policy/bundle.entity';
import { ItemDiscountEntity } from 'src/policy/domain/price-policy/item-discount.entity';
import { ItemPriceEntity } from 'src/policy/domain/price-policy/item-price.entity';
import { Repository } from 'typeorm';

/**
 * Data seeder for POC - seeds initial test data
 */
@Injectable()
export class DataSeeder {
  private readonly logger = new Logger(DataSeeder.name);

  constructor(
    @InjectRepository(ItemPriceEntity)
    private readonly itemPriceRepository: Repository<ItemPriceEntity>,
    @InjectRepository(ItemDiscountEntity)
    private readonly itemDiscountRepository: Repository<ItemDiscountEntity>,
    @InjectRepository(BundleEntity)
    private readonly bundleRepository: Repository<BundleEntity>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding initial data...');

    await this.seedItemPrices();
    await this.seedItemDiscounts();
    await this.seedBundles();

    this.logger.log('Seeding completed!');
  }

  private async seedItemPrices(): Promise<void> {
    const items = [
      { itemId: 'ITEM-001', price: 29.99, description: 'Basic Widget' },
      { itemId: 'ITEM-002', price: 49.99, description: 'Premium Widget' },
      { itemId: 'ITEM-003', price: 99.99, description: 'Deluxe Widget' },
      { itemId: 'ITEM-004', price: 14.99, description: 'Mini Widget' },
      { itemId: 'ITEM-005', price: 199.99, description: 'Ultra Widget' },
      { itemId: 'ITEM-006', price: 9.99, description: 'Accessory A' },
      { itemId: 'ITEM-007', price: 12.99, description: 'Accessory B' },
      { itemId: 'ITEM-008', price: 24.99, description: 'Accessory C' },
    ];

    for (const item of items) {
      const price = ItemPriceEntity.create(
        item.itemId,
        Region.DE,
        item.price,
        Currency.EUR,
      );
      await this.itemPriceRepository.save(price);
    }

    this.logger.log(`Seeded ${items.length} item prices`);
  }

  private async seedItemDiscounts(): Promise<void> {
    const now = new Date();
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const discounts = [
      { itemId: 'ITEM-001', amount: 0.1 }, // 10% off
      { itemId: 'ITEM-003', amount: 0.15 }, // 15% off
      { itemId: 'ITEM-005', amount: 0.2 }, // 20% off
    ];

    for (const discount of discounts) {
      const entity = ItemDiscountEntity.create(
        discount.itemId,
        Region.DE,
        now,
        oneMonthFromNow,
        discount.amount,
      );
      await this.itemDiscountRepository.save(entity);
    }

    this.logger.log(`Seeded ${discounts.length} item discounts`);
  }

  private async seedBundles(): Promise<void> {
    // Bundle 1: Starter Pack
    const starterPack = BundleEntity.create(
      'Starter Pack',
      'Perfect bundle for beginners - includes Basic Widget and accessories',
      new Money(59.99, Currency.EUR),
      0.15, // 15% discount
    );
    starterPack.addItem('ITEM-001', 1); // Basic Widget
    starterPack.addItem('ITEM-006', 1); // Accessory A
    starterPack.addItem('ITEM-007', 1); // Accessory B
    await this.bundleRepository.save(starterPack);

    // Bundle 2: Pro Pack
    const proPack = BundleEntity.create(
      'Pro Pack',
      'Professional bundle with Premium Widget and all accessories',
      new Money(99.99, Currency.EUR),
      0.2, // 20% discount
    );
    proPack.addItem('ITEM-002', 1); // Premium Widget
    proPack.addItem('ITEM-006', 2); // Accessory A x2
    proPack.addItem('ITEM-007', 2); // Accessory B x2
    proPack.addItem('ITEM-008', 1); // Accessory C
    await this.bundleRepository.save(proPack);

    // Bundle 3: Ultimate Pack
    const ultimatePack = BundleEntity.create(
      'Ultimate Pack',
      'The complete package - includes Deluxe Widget and Ultra Widget',
      new Money(349.99, Currency.EUR),
      0.25, // 25% discount
    );
    ultimatePack.addItem('ITEM-003', 1); // Deluxe Widget
    ultimatePack.addItem('ITEM-005', 1); // Ultra Widget
    ultimatePack.addItem('ITEM-006', 3); // Accessory A x3
    ultimatePack.addItem('ITEM-007', 3); // Accessory B x3
    ultimatePack.addItem('ITEM-008', 2); // Accessory C x2
    await this.bundleRepository.save(ultimatePack);

    this.logger.log('Seeded 3 bundles');
  }
}
