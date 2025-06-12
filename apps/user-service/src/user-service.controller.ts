import {
  Controller
} from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
import { Payload } from '@nestjs/microservices';
import { UUID } from 'crypto';
import { User } from './entities/user.entity';

@Controller()
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) { }

  @MessagePattern('user_created')
  async handleUserCreated(@Payload() payload: { email: string }) {
    const res = await this.userServiceService.createUser(payload.email);
    return JSON.parse(JSON.stringify(res));
  }

  @MessagePattern('connect_social_account')
  async handleConnectSocialAccount(@Payload() payload: { user: User, provider: string, metadata: any }) {
    await this.userServiceService.connectSocialAccount(payload.user, payload.provider, payload.metadata);
  }

  @MessagePattern('find_one_by')
  async findOneBy(@Payload() payload: { email?: string, id?: UUID }) {

    const res = await this.userServiceService.findOneBy(payload);
    return JSON.parse(JSON.stringify(res));
  }

  @GrpcMethod('UserService', 'GetUser')
  async getUserGrpc(data: { id: UUID }) {
    return await this.userServiceService.findOneBy({ id: data.id });
  }
}
