import { IsBoolean, IsEmail, IsString, IsUrl, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class GoogleUserDto {
  @IsUUID()
  id: UUID;

  @IsEmail()
  email: string;

  @IsBoolean()
  verified_email: boolean;

  @IsString()
  name: string;

  @IsString()
  given_name: string;

  @IsString()
  family_name: string;

  @IsUrl()
  picture: string;

  @IsString()
  hd: string;
}
