import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UserServiceService } from './user-service.service';

@Controller()
export class UserKafkaController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @EventPattern('user_created')
  handleUserCreated(@Payload() message: any) {
    console.log('Received user_created:', message.value);
    this.userServiceService.findOrCreate(message.value);
  }
}
