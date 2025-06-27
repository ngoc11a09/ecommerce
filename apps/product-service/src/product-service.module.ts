import { Module } from '@nestjs/common';
import { ProductServiceController } from './product-service.controller';
import { ProductServiceService } from './product-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaModule } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CaslModule } from '@app/common';
import { Category } from './entities/category.entity';
import { Variant } from './entities/variant.entity';
import { Product } from './entities/product.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GrpcErrorInterceptor } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/product-service/.env',
    }),
    KafkaModule,
    ClientsModule.registerAsync([
      {
        name: 'PRODUCT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: configService.get('KAFKA_CLIENT_ID') || 'product',
              brokers: [
                configService.get<string>('KAFKA_BROKER') || 'localhost:9092',
              ],
            },
            consumer: {
              groupId:
                configService.get('KAFKA_GROUP_ID') + Date.now() ||
                'product-consumer',
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
      entities: [Category, Product, Variant],
      synchronize: true,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([Category, Product, Variant]),
  ],
  controllers: [ProductServiceController],
  providers: [
    ProductServiceService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcErrorInterceptor,
    },
  ],
})
export class ProductServiceModule { }
