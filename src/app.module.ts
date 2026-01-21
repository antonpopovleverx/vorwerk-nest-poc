import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Common
import { CommonModule } from './_common/common.module';

// Subdomains
import { BasketModule } from './basket/basket.module';
import { PolicyModule } from './policy/policy.module';
import { OrderModule } from './order/order.module';

// Entities for TypeORM
import { BasketEntity } from './basket/domain/basket/basket.entity';
import { BasketItemEntity } from './basket/domain/basket/basket-item.entity';
import { BasketBundleEntity } from './basket/domain/basket/basket-bundle.entity';
import { BundleEntity } from './policy/domain/price-policy/bundle.entity';
import { BundleContentEntity } from './policy/domain/price-policy/bundle-content.entity';
import { ItemPriceEntity } from './policy/domain/price-policy/item-price.entity';
import { ItemDiscountEntity } from './policy/domain/price-policy/item-discount.entity';
import { OrderEntity } from './order/domain/order/order.entity';
import { QuoteEntity } from './order/domain/quote/quote.entity';

// Seeding
import { DataSeeder } from './infra/seeding/data-seeder.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:', // In-memory for POC
      synchronize: true, // Auto-create tables - only for POC
      logging: false,
      entities: [
        BasketEntity,
        BasketItemEntity,
        BasketBundleEntity,
        BundleEntity,
        BundleContentEntity,
        ItemPriceEntity,
        ItemDiscountEntity,
        OrderEntity,
        QuoteEntity,
      ],
    }),
    TypeOrmModule.forFeature([
      ItemPriceEntity,
      ItemDiscountEntity,
      BundleEntity,
      BundleContentEntity,
    ]),
    CommonModule,
    BasketModule,
    PolicyModule,
    OrderModule,
  ],
  providers: [DataSeeder],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly dataSeeder: DataSeeder) {}

  async onModuleInit() {
    // Seed initial data for POC
    await this.dataSeeder.seed();
  }
}
