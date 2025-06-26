import { NestFactory } from '@nestjs/core';
import { ProductServiceModule } from './product-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(ProductServiceModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: configService.get<string>('KAFKA_CLIENT_ID')!,
        brokers: [configService.get<string>('KAFKA_BROKER')!],
      },
      consumer: {
        groupId: configService.get<string>('KAFKA_GROUP_ID')! + Date.now(),
      },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'product',
      protoPath: join(process.cwd(), 'apps/product-service/proto/product.proto'),
      url: '0.0.0.0:50054',
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3005);
}
bootstrap();
