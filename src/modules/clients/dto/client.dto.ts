import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';
export class UpsertClientDto {
  @IsUUID() companyClientId: string;
  @IsString() name: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() address?: string;
}
