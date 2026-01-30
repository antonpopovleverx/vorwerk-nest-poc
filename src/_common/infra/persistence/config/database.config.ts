import { TypeOrmModuleOptions } from '@nestjs/typeorm';


export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:', 
  synchronize: true,
  logging: true,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
};
