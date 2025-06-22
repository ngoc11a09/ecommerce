import { Module } from '@nestjs/common';
import { UserServiceController } from './user-service.controller';
import { UserServiceService } from './user-service.service';
import { User } from 'apps/user-service/src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CaslModule } from '@app/common/casl/casl.module';
import { CaslAbilityFactory, PoliciesGuard } from '@app/common';
import { SocialAccount } from './entities/social-acc.entity';
import { Shop } from 'apps/shop-service/src/entities/shop.entity';
import { ShopMember } from 'apps/shop-service/src/entities/shop-member.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/user-service/.env',
    }),
    CaslModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User, SocialAccount, Shop, ShopMember],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, SocialAccount, Shop, ShopMember]),
  ],
  controllers: [UserServiceController],
  providers: [UserServiceService, CaslAbilityFactory, PoliciesGuard],
})
export class UserServiceModule { }
