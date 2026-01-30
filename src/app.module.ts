import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommonModule } from "src/_common/common.module";
import { BasketBundleEntity } from "src/basket/domain/basket/basket-bundle.entity";
import { BasketItemEntity } from "src/basket/domain/basket/basket-item.entity";
import { BasketEntity } from "src/basket/domain/basket/basket.entity";
import { BasketModule } from "src/basket/infra/nest-module/basket.module";



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

      ],
    }),
    TypeOrmModule.forFeature([

    ]),
    CommonModule,
    BasketModule,

  ],
  providers: [],
})
export class AppModule {

}
