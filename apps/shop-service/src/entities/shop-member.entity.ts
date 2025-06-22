// apps/shop-service/src/entities/shop-user.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Shop } from './shop.entity';
import { User } from 'apps/user-service/src/entities/user.entity';
import { UUID } from 'crypto';
import { ShopMemberRole } from '@app/common';

@Entity('shop_member')
export class ShopMember {
    @PrimaryGeneratedColumn('uuid')
    id: UUID;

    @ManyToOne(() => Shop, shop => shop.members)
    shop: Shop;

    @ManyToOne(() => User, user => user.members)
    user: User;

    @Column({
        type: 'enum',
        enum: ShopMemberRole,
        default: ShopMemberRole?.STAFF
    })
    role: ShopMemberRole;
}