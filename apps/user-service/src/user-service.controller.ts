import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { Payload } from '@nestjs/microservices';
import { User } from './entities/user.entity';
import { Action, AppAbility, CheckPolicies, PoliciesGuard } from '@app/common';
import { UUID } from 'crypto';

@Controller()
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @EventPattern('user_created')
  async handleUserCreated(@Payload() user: User) {
    await this.userServiceService.findOrCreate(user);
  }

  @MessagePattern('find_one_by')
  async findOneBy(@Payload() payload: { email: string }) {
    const res = await this.userServiceService.findOneBy(payload);
    return JSON.parse(JSON.stringify(res));
  }

  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.cannot(Action.Read, User))
  findAll() {
    return this.userServiceService.findAll();
  }

  @Get(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, User))
  findOne(@Param('id') id: UUID) {
    return this.userServiceService.findOne(id);
  }
}
