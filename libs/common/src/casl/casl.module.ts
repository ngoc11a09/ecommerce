import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory/casl-ability.factory';

@Module({})
export class CaslModule {
  providers: [CaslAbilityFactory];
  exports: [CaslAbilityFactory];
}
