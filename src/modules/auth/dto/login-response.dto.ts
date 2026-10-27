/** Payload user yang dikembalikan setelah login berhasil */
export class AuthUserDto {
  /**
   * UUID pengguna
   * @example d290f1ee-6c54-4b01-90e6-d701748f0851
   */
  id: string;

  /**
   * Nama lengkap pengguna
   * @example Geusan Ulun
   */
  name: string;

  /**
   * Email pengguna
   * @example geusan@makromedia.com
   */
  email: string;

  /**
   * Role pengguna dalam sistem
   * @example DIREKTUR
   */
  role: string;
}

/** Response body untuk endpoint POST /auth/login */
export class LoginResponseDto {
  /**
   * JWT access token
   * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   */
  accessToken: string;

  /** Data pengguna yang berhasil login */
  user: AuthUserDto;
}
