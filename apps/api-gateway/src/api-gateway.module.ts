import { Module } from '@nestjs/common';
import { ApiGatewayController, AuthController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api-gateway/.env',
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(process.cwd(), 'apps/user-service/proto/user.proto'),
          url: 'localhost:50051',
        },
      },
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(process.cwd(), 'apps/auth-service/proto/auth.proto'),
          url: 'localhost:50052',
        },
      },
    ]),
  ],
  controllers: [ApiGatewayController, AuthController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule { }
