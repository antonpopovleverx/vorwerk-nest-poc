import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './_common/common.module';
import { BasketModule } from './basket/infra/nest-module/basket.module';
import { PolicyModule } from './policy/infra/nest-module/policy.module';
import { OrderModule } from './order/infra/nest-module/order.module';
import { BasketEntity } from './basket/domain/basket/basket.entity';
import { BasketItemEntity } from './basket/domain/basket/basket-item.entity';
import { BasketBundleEntity } from './basket/domain/basket/basket-bundle.entity';
import { BundleEntity } from './policy/domain/price-policy/bundle.entity';
import { BundleContentEntity } from './policy/domain/price-policy/bundle-content.entity';
import { ItemPriceEntity } from './policy/domain/price-policy/item-price.entity';
import { ItemDiscountEntity } from './policy/domain/price-policy/item-discount.entity';
import { OrderEntity } from './order/domain/order/order.entity';
import { QuoteEntity } from './order/domain/quote/quote.entity';


import { DataSeeder } from './_common/infra/persistence/seeding/data-seeder';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true, 
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
