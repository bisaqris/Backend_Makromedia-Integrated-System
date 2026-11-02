import {
  IsDateString, IsEmail, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class UpsertManpowerDto {
  @IsString()
  name: string;

  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsUUID() positionId?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() skill?: string;
  @IsOptional() @IsString() employmentStatus?: string;
  @IsOptional() @IsEnum(Gender) gender?: Gender;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsString() province?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() subdistrict?: string;
  @IsOptional() @IsString() village?: string;
  @IsOptional() @IsString() detailAddress?: string;
  @IsOptional() @IsString() bankName?: string;
  @IsOptional() @IsString() bankAccountNo?: string;
  @IsOptional() @IsString() accountHolder?: string;
  @IsOptional() @IsNumber() @Min(0) standardRate?: number;
}
