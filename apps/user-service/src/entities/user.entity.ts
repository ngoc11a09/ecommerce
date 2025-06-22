import { UUID } from 'crypto';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany } from 'typeorm';
import { SocialAccount } from './social-acc.entity';
import { Shop } from 'apps/shop-service/src/entities/shop.entity';
import { ShopMember } from 'apps/shop-service/src/entities/shop-member.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ default: false, nullable: false })
  isAdmin: boolean;

  @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user, { cascade: true })
  socialAccounts: SocialAccount[];

  @OneToMany(() => ShopMember, (shopMember) => shopMember.user, { cascade: true })
  members: ShopMember[];

  connectSocialAccount({
    provider,
    metadata,
  }: {
    provider: string;
    metadata: any;
  }) {
    const isExist = this.socialAccounts?.find((acc) => acc.provider === provider);
    if (isExist) {
      throw new Error('SOCIAL_ACCOUNT_ALREADY_EXISTS');
    } else {
      const newAccount = new SocialAccount();
      newAccount.provider = provider;
      newAccount.metadata = metadata;
      newAccount.user = this;

      if (!this.socialAccounts) this.socialAccounts = [];
      this.socialAccounts.push(newAccount);
    }

  }
}