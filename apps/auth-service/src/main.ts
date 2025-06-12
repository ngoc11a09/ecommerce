import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(process.cwd(), 'apps/auth-service/proto/auth.proto'),
      url: '0.0.0.0:50052',
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
