import { UUID } from "crypto";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class SocialAccount {
    @PrimaryGeneratedColumn('uuid')
    id: UUID;

    @Column({ nullable: false })
    provider: string;

    @Column({ type: 'jsonb' })
    metadata: any;

    @ManyToOne(() => User, (user) => user.id)
    user: User;
}