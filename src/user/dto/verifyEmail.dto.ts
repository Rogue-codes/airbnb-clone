import { IsString, IsEmail, IsDateString, MinLength, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  token: string;

}

export class ResendTokenDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}