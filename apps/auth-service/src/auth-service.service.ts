import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { User } from '@app/common';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthServiceService implements OnModuleInit {
  private readonly ggClient: OAuth2Client;

  constructor(
    @Inject('AUTH_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.ggClient = new OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
  }

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('find_one_by');
    this.kafkaClient.subscribeToResponseOf('user_created');
    this.kafkaClient.subscribeToResponseOf('connect_social_account');
    await this.kafkaClient.connect();
  }

  getPayload(user: User) {
    return {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };
  }

  async loginWithGoogle(ggUser) {
    if (!ggUser) {
      throw new Error('User not found');
    }

    const data = await firstValueFrom(
      this.kafkaClient.send('find_one_by', { email: ggUser.email }),
    );

    if (data) {
      return {
        access_token: this.jwtService.sign(this.getPayload(data)),
        user: this.getPayload(data)
      };
    }

    const user = await firstValueFrom(this.kafkaClient.send('user_created', { email: ggUser.email }));
    await firstValueFrom(this.kafkaClient.send('connect_social_account', {
      user: user,
      provider: 'google',
      metadata: {
        ggUser,
      },
    }));

    const payload = this.getPayload(user);

    return {
      access_token: this.jwtService.sign(payload),
      user: payload
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

    const payload = this.getPayload(user);

    return {
      access_token: this.jwtService.sign(payload),
      user: payload
    };
  }
}
