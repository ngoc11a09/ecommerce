import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserServiceService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) { }
  async createUser(email: string) {
    const newUser = {
      email,
      password: bcrypt.hashSync(this.configService.get('DEFAULT_USER_PASSWORD'), Number(this.configService.get('SALT_ROUNDS'))),
      isAdmin: false,
    }
    const user = this.userRepository.create(newUser);
    return await this.userRepository.save(user);
  }

  async connectSocialAccount(user: User, provider: string, metadata: any) {
    Object.setPrototypeOf(user, User.prototype);
    user.connectSocialAccount({ provider, metadata });
    return this.userRepository.save(user);
  }

  async createAdmin(user: Partial<User>) {
    this.userRepository.create(user);
    return this.userRepository.save(user);
  }

  async findAll() {
    return this.userRepository.find({ where: { isAdmin: false } });
  }

  async findOneBy(query: Record<string, any>) {
    const allowedFields = ['email', 'id'];
    const where: Record<string, string> = {};

    for (const key of allowedFields) {
      if (query[key]) {
        where[key] = query[key];
      }
    }

    if (Object.keys(where).length === 0) {
      throw new BadRequestException('At least one query field is required');
    }

    return this.userRepository.findOne({ where });
  }
}
