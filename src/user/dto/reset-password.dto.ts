import { IsString, IsEmail, IsDateString, MinLength, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  otp: string;
  
  @IsString()
  @MinLength(6)
  password: string;

  
  @IsString()
  @MinLength(6)
  confirmPassword: string;

}