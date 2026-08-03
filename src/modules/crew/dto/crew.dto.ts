import { IsEmail, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpsertCrewDto {
  @IsString()
  name: string;

  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() skill?: string;
  @IsOptional() @IsString() employmentStatus?: string;
  @IsOptional() @IsString() bankName?: string;
  @IsOptional() @IsString() bankAccountNo?: string;
  @IsOptional() @IsNumber() @Min(0) standardRate?: number;
}
