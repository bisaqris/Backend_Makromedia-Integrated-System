import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { RoleUser } from '@prisma/client';

export class CreateUserDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsEnum(RoleUser) role: RoleUser;
}
