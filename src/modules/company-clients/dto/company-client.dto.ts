import { IsEmail, IsOptional, IsString } from 'class-validator';
export class UpsertCompanyClientDto {
  @IsString() name: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() address?: string;
}
