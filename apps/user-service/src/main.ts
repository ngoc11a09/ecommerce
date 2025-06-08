import { NestFactory } from '@nestjs/core';
import { UserServiceModule } from './user-service.module';
import { MicroserviceOptions, TcpStatus } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = await NestFactory.create(UserServiceModule);
  const configService = app.get(ConfigService);

  const server = app.connectMicroservice<MicroserviceOptions>({
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

  server.status.subscribe((status: TcpStatus) => {
    console.log(status);
  });

  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
