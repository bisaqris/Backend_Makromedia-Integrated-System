import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;

  // Data profil tambahan (dipakai halaman Profile di FE)
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() province?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() subdistrict?: string;
  @IsOptional() @IsString() village?: string;
  @IsOptional() @IsString() detailAddress?: string;
  @IsOptional() @IsString() bankName?: string;
  @IsOptional() @IsString() bankAccountNo?: string;

  // Posisi/jabatan (referensi master Position)
  @IsOptional() @IsUUID() positionId?: string;

  // Daftar skill (referensi master Skill) — mengganti seluruh daftar skill user
  @IsOptional() @IsArray() @ArrayUnique() @IsUUID('4', { each: true }) skillIds?: string[];
}

export class ChangePasswordDto {
  @IsString() oldPassword: string;
  @IsString() @MinLength(8) newPassword: string;
}
