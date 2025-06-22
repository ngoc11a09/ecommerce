import { User } from "apps/user-service/src/entities/user.entity";
import { UUID } from "crypto";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ShopMember } from "./shop-member.entity";

@Entity()
export class Shop {
    @PrimaryGeneratedColumn('uuid')
    id: UUID;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column()
    description: string;

    @OneToMany(() => ShopMember, (shopMember) => shopMember.shop, { cascade: true })
    members: ShopMember[];
}