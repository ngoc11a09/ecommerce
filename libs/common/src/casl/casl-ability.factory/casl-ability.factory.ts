import { ExtractSubjectType } from '@casl/ability';
import { createMongoAbility } from '@casl/ability';
import { AbilityBuilder } from '@casl/ability';
import { Action } from '@app/common/constants/actions.consant';
import { MongoAbility } from '@casl/ability';
import { InferSubjects } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from 'apps/user-service/src/entities/user.entity';
import { Role } from '@app/common';

type Subjects = InferSubjects<typeof User> | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    if (user?.roles.includes(Role.ADMIN)) {
      can(Action.Manage, 'all');
    } else {
      can(Action.Read, 'all');
    }

    can(Action.Update, User, { id: user?.id });
    cannot(Action.Delete, User, { id: user?.id });

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
