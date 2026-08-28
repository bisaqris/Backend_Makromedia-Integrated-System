import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { RoleUser } from '@prisma/client';

export class CreateUserDto {
  /**
   * Nama lengkap pengguna
   * @example Geusan Ulun
   */
  @IsString() name: string;

  /**
   * Email pengguna (harus unik)
   * @example geusan@makromedia.com
   */
  @IsEmail() email: string;

  /**
   * Password (minimal 8 karakter)
   * @example RahasiaSekali8!
   */
  @IsString() @MinLength(8) password: string;

  /**
   * Role pengguna dalam sistem
   * @example SALES
   */
  @IsEnum(RoleUser) role: RoleUser;
}
