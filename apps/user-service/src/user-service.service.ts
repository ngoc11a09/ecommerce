import { Role } from '@app/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GoogleUserDto } from './dtos/google-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UUID } from 'crypto';

@Injectable()
export class UserServiceService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOrCreate(googleUser: GoogleUserDto) {
    if (!googleUser.googleId) {
      throw new Error('No user is submitted');
    }

    let user = await this.userRepository.findOne({
      where: { googleId: googleUser.googleId },
    });

    if (user) {
      return user;
    }

    user = this.userRepository.create({ ...googleUser, roles: [Role.USER] });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(data: Partial<User>) {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async findAll() {
    return this.userRepository.find();
  }

  async findOne(id?: UUID, googleId?: string) {
    if (id) {
      return this.userRepository.findOne({ where: { id } });
    }

    if (googleId) {
      return this.userRepository.findOne({ where: { googleId } });
    }
  }

  async findOneBy(query: Record<string, string>) {
    const allowedFields = ['email', 'googleId', 'id'];
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
