import { Module } from '@nestjs/common';
import { ShopServiceController } from './shop-service.controller';
import { ShopServiceService } from './shop-service.service';
import { CaslModule, KafkaModule } from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { User } from 'apps/user-service/src/entities/user.entity';
import { SocialAccount } from 'apps/user-service/src/entities/social-acc.entity';
import { ShopMember } from './entities/shop-member.entity';
import { Partitioners } from 'kafkajs';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
      entities: [Shop, User, SocialAccount, ShopMember],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Shop, User, SocialAccount, ShopMember]),
  ],
  controllers: [ShopServiceController],
  providers: [ShopServiceService],
})
export class ShopServiceModule { }
