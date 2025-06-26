import { Controller } from '@nestjs/common';
import { ShopServiceService } from './shop-service.service';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { Shop } from './entities/shop.entity';
import { User } from '@app/common';
import { UUID } from 'crypto';

@Controller()
export class ShopServiceController {
  constructor(private readonly shopServiceService: ShopServiceService) { }

  @GrpcMethod('ShopService', 'CreateShop')
  async createShop(@Payload() payload: { shop: Partial<Shop>, user: User }) {
    return this.shopServiceService.createShop(payload.shop, payload.user);
  }

  @GrpcMethod('ShopService', 'GetShopMemberRole')
  async getShopMemberRole(@Payload() payload: { userId: UUID, shopId: UUID }) {
    return this.shopServiceService.getShopMemberRole(payload.userId, payload.shopId);
  }
}
