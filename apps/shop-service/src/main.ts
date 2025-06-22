import { NestFactory } from '@nestjs/core';
import { ShopServiceModule } from './shop-service.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(ShopServiceModule);
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
      package: 'shop',
      protoPath: join(process.cwd(), 'apps/shop-service/proto/shop.proto'),
      url: '0.0.0.0:50053',
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3004);
}
bootstrap();
