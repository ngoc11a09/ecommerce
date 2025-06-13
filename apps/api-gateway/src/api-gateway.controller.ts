import { Controller, Get, Inject, OnModuleInit, Param, Query, Res } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { UUID } from 'crypto';
import { firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { User } from '@app/common';

interface UserServiceGrpc {
  getUser(data: { id: UUID }): Observable<User>;
}

interface AuthServiceGrpc {
  GGLogin(data: { code: string }): Observable<{ accessToken: string, user: User }>;
}

@Controller('user')
export class ApiGatewayController implements OnModuleInit {
  private userService: UserServiceGrpc;

  constructor(@Inject('USER_SERVICE') private readonly client: ClientGrpc) { }

  onModuleInit() {
    this.userService = this.client.getService<UserServiceGrpc>('UserService');
  }

  @Get(':id')
  async getUser(@Param('id') id: UUID) {
    return firstValueFrom(this.userService.getUser({ id }));
  }
}

@Controller('auth')
export class AuthController {
  private authServiceGrpc: AuthServiceGrpc;

  constructor(
    @Inject('AUTH_SERVICE') private readonly client: ClientGrpc,
    private readonly configService: ConfigService,
  ) { }

  onModuleInit() {
    this.authServiceGrpc = this.client.getService<AuthServiceGrpc>('AuthService');
  }

  @Get('google')
  redirectToGoogle(@Res() res: Response) {
    const redirectUri = encodeURIComponent(this.configService.get('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/auth/google/callback');
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const scope = encodeURIComponent('email profile');
    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    return res.redirect(url);
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    const result = await lastValueFrom(
      this.authServiceGrpc.GGLogin({ code }),
    );
    res.json({ access_token: result.accessToken?.toString(), user: result.user });
    return;
  }
}

