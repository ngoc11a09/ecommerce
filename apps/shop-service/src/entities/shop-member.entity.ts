// apps/shop-service/src/entities/shop-user.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Shop } from './shop.entity';
import { UUID } from 'crypto';
import { ShopMemberRole } from '@app/common';

@Entity('shop_member')
export class ShopMember {
    @PrimaryGeneratedColumn('uuid')
    id: UUID;

    @Column({ type: 'uuid', nullable: false })
    userId: string;

    @Column({ type: 'uuid', nullable: false })
    shopId: string;

    @ManyToOne(() => Shop, shop => shop.members)
    @JoinColumn({ name: 'shopId' })
    shop: Shop;

    @Column({
        type: 'enum',
        enum: ShopMemberRole,
        default: ShopMemberRole?.STAFF
    })
    role: ShopMemberRole;
}