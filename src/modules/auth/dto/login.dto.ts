import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  /**
   * Email akun pengguna
   * @example geusan@makromedia.com
   */
  @IsEmail()
  email: string;

  /**
   * Password akun (minimal 6 karakter)
   * @example rahasia123
   */
  @IsString()
  @MinLength(6)
  password: string;
}
