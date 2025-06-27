import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { GlobalExceptionFilter } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(process.env.GATEWAY_PORT ?? 3000);
}
bootstrap();
