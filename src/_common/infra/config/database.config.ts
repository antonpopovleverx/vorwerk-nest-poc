import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Database configuration for SQLite (POC purposes)
 */
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:', // In-memory for POC
  synchronize: true, // Auto-create tables - only for POC
  logging: true,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
};
