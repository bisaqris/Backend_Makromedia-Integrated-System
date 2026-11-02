import { IsEmail, IsOptional, IsString } from 'class-validator';
export class UpsertCompanyClientDto {
  @IsString() name: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() province?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() subdistrict?: string;
  @IsOptional() @IsString() village?: string;
  @IsOptional() @IsString() postalCode?: string;
}
