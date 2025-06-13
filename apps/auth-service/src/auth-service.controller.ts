import {
  Body, Controller, Post
} from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { GrpcMethod } from '@nestjs/microservices';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthServiceController {
  constructor(
    private authService: AuthServiceService,
    private readonly configService: ConfigService,
  ) { }

  @Post('admin-login')
  async adminLogin(@Body() body: { email: string; password: string }) {
    return this.authService.loginWithAdmin(body);
  }

  @GrpcMethod('AuthService', 'GGLogin')
  async ggLogin(data: { code: string }) {
    const oauth2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_CALLBACK_URL'),
    );

    const { tokens } = await oauth2Client.getToken(data.code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const response = await oauth2.userinfo.get();

    const res = await this.authService.loginWithGoogle(response.data);

    return {
      accessToken: res.access_token,
      user: res.user
    };
  }
}
