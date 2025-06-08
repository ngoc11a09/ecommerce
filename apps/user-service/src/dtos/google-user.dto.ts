import { IsEmail, IsString, IsUrl, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class GoogleUserDto {
  @IsUUID()
  id: UUID;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsUrl()
  picture: string;

  @IsString()
  googleId: string;
}
