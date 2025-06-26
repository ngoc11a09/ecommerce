import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserController, AuthController, ShopController, ProductController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GoogleStrategy, JwtStrategy, GoogleOAuthGuard, JwtAuthGuard } from '@app/auth';
import { CaslAbilityFactory, PoliciesGuard } from '@app/common';
import { ShopPoliciesGuard } from './guards/shop-policies.guard';

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
      {
        name: 'SHOP_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'shop',
          protoPath: join(process.cwd(), 'apps/shop-service/proto/shop.proto'),
          url: 'localhost:50053',
        },
      },
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'product',
          protoPath: join(process.cwd(), 'apps/product-service/proto/product.proto'),
          url: 'localhost:50054',
        },
      },
    ]),
  ],
  controllers: [UserController, AuthController, ShopController, ProductController],
  providers: [
    ApiGatewayService,
    GoogleStrategy,
    JwtStrategy,
    GoogleOAuthGuard,
    JwtAuthGuard,
    CaslAbilityFactory,
    PoliciesGuard,
    ShopPoliciesGuard,
  ],
})
export class ApiGatewayModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(ShopMemberMiddleware)
  //     .forRoutes({ path: 'product/*', method: RequestMethod.ALL });
  // }
}
