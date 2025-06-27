import { Inject, Injectable } from '@nestjs/common';
import { Shop } from './entities/shop.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ShopMemberRole, User } from '@app/common';
import { UUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { ClientKafka } from '@nestjs/microservices';
import { ShopMember } from './entities/shop-member.entity';
import { BadRequestException } from '@app/common';

@Injectable()
export class ShopServiceService {
  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    @InjectRepository(ShopMember)
    private shopMemberRepository: Repository<ShopMember>,
    @Inject('SHOP_SERVICE') private readonly kafkaClient: ClientKafka,
  ) { }

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('find_one_by');
    await this.kafkaClient.connect();
  }

  async getUser(userId: UUID) {
    return await firstValueFrom(this.kafkaClient.send('find_one_by', {
      id: userId
    }));
  }

  async createShop(newShop: Partial<Shop>, owner: User) {
    const shop = await this.shopRepository.findOne({ where: { email: newShop.email } });

    if (shop) {
      throw new BadRequestException('Shop is already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const createdShop = this.shopRepository.create({
      ...newShop,
      members: [{
        userId: owner.id,
        shopId: newShop.id,
        role: ShopMemberRole.OWNER
      }]
    });

    return this.shopRepository.save(createdShop);
  }

  async getShopMemberRole(userId: UUID, shopId: UUID): Promise<{ role: ShopMemberRole }> {
    const shopMember = await this.shopMemberRepository.findOne({
      where: { userId, shopId }
    });
    return { role: shopMember?.role as ShopMemberRole }
  }
}
