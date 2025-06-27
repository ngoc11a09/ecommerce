import { Module } from '@nestjs/common';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { ClientsModule } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { PassportModule } from '@nestjs/passport';
import { KafkaModule } from '@app/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GrpcErrorInterceptor } from '@app/common';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/auth-service/.env',
    }),
    KafkaModule,
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: configService.get('KAFKA_CLIENT_ID') || 'auth',
              brokers: [
                configService.get<string>('KAFKA_BROKER') || 'localhost:9092',
              ],
              createPartitioner: Partitioners.LegacyPartitioner,
            },
            consumer: {
              groupId:
                configService.get('KAFKA_GROUP_ID') + Date.now() ||
                'auth-consumer',
            },
          },
        }),
      },
    ]),
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') || '3h' },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  controllers: [AuthServiceController],
  providers: [
    AuthServiceService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcErrorInterceptor,
    },
  ],
})
export class AuthServiceModule { }
