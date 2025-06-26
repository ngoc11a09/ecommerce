import { ExtractSubjectType } from '@casl/ability';
import { createMongoAbility } from '@casl/ability';
import { AbilityBuilder } from '@casl/ability';
import { Action } from '@app/common/constants/actions.consant';
import { MongoAbility } from '@casl/ability';
import { InferSubjects } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from 'apps/user-service/src/entities/user.entity';
import { ShopMemberRole } from '@app/common/types/shop-member-role.type';

type Subjects = InferSubjects<typeof User> | 'all' | 'Category' | 'Product' | 'SuperCategory';

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User & { shopMemberRole?: ShopMemberRole }) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    if (user?.isAdmin) {
      can(Action.Manage, 'all');
    } else {
      can(Action.Read, 'all');
    }

    if (user?.shopMemberRole) {
      switch (user.shopMemberRole) {
        case ShopMemberRole.OWNER:
          can(Action.Manage, 'Product');
          can(Action.Manage, 'Category');
          break;
        case ShopMemberRole.OPERATOR:
          can(Action.Create, 'Product');
          can(Action.Update, 'Product');
          can(Action.Read, 'Product');
          can(Action.Create, 'Category');
          can(Action.Update, 'Category');
          can(Action.Read, 'Category');
          break;
        case ShopMemberRole.STAFF:
          can(Action.Read, 'Product');
          can(Action.Read, 'Category');
          break;
      }
    }

    can(Action.Update, User, { id: user?.id });
    cannot(Action.Delete, User, { id: user?.id });

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
