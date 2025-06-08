import { Role } from '@app/common';
import { UUID } from 'crypto';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn('uuid')
  id: UUID;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  name: string;

  @Column({ default: 'fW3pDxx@>', nullable: false })
  password: string;

  @Column({ type: 'enum', enum: Role, default: [Role.USER], nullable: false })
  roles: Role[];

  @Column({ nullable: true })
  picture: string;

  @Column({ unique: true, nullable: true })
  googleId: string;
}
