import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { User } from '@app/common';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthServiceService {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,

    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('find_one_by');
    await this.kafkaClient.connect();
  }

  async loginWithGoogle(user: any) {
    if (!user) {
      throw new Error('User not found');
    }

    const payload: any = this.getPayloadToken(user);

    this.kafkaClient.emit('user_created', { id: payload.id, ...user });

    return {
      access_token: this.jwtService.sign(payload),
      user: { id: payload.id, ...user },
    };
  }

  private getPayloadToken(user: any): any {
    return {
      id: user.id || randomUUID(),
      email: user.email,
      roles: user.roles,
      isConnectedGoogle: !!user.googleId,
    };
  }

  async findUser(email: string) {
    try {
      const data = await firstValueFrom(
        this.kafkaClient.send('find_one_by', { email }),
      );
      return data;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  async loginWithAdmin(body: { email: string; password: string }) {
    const user = await this.findUser(body.email);
    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return {
      access_token: this.jwtService.sign(this.getPayloadToken(user)),
      user,
    };
  }
}
