import { Module } from '@nestjs/common';
import { ShopServiceController } from './shop-service.controller';
import { ShopServiceService } from './shop-service.service';
import { CaslModule, GrpcErrorInterceptor, KafkaModule } from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { ShopMember } from './entities/shop-member.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PoliciesGuard } from '@app/common/casl/policies.guard';
import { CaslAbilityFactory } from '@app/common/casl/casl-ability.factory/casl-ability.factory';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/shop-service/.env',
    }),
    KafkaModule,
    ClientsModule.registerAsync([
      {
        name: 'SHOP_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: configService.get('KAFKA_CLIENT_ID') || 'shop',
              brokers: [
                configService.get<string>('KAFKA_BROKER') || 'localhost:9092',
              ],
            },
            consumer: {
              groupId:
                configService.get('KAFKA_GROUP_ID') + Date.now() ||
                'shop-consumer',
            },
          },
        }),
      },
    ]),
    CaslModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [Shop, ShopMember],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Shop, ShopMember]),
  ],
  controllers: [ShopServiceController],
  providers: [
    ShopServiceService,
    PoliciesGuard,
    CaslAbilityFactory,
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcErrorInterceptor,
    },
  ],
  exports: [ClientsModule],
})
export class ShopServiceModule { }
