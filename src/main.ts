import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './_common/infra/observability/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app, {
    title: 'VW NestJS POC API',
    version: '1.0.0',
    path: 'docs',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
