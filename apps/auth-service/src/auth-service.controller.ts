import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { ClientKafka } from '@nestjs/microservices';

@Controller('auth')
export class AuthServiceController {
  constructor(
    private authService: AuthServiceService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}



  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Req() req) {
    return this.authService.loginWithGoogle(req.user);
  }

  @Post('admin-login')
  async adminLogin(@Body() body: { email: string; password: string }) {
    return this.authService.loginWithAdmin(body);
  }
}
