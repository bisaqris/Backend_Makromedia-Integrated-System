import {
  IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min,
} from 'class-validator';
import { KategoriProyek } from '@prisma/client';

export class CreateProjectDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(KategoriProyek) category: KategoriProyek;
  @IsUUID() clientId: string;
  @IsOptional() @IsUUID() projectManagerId?: string;
  @IsOptional() @IsString() clientType?: string;
  @IsOptional() @IsString() partnershipModel?: string;
  @IsOptional() @IsString() venue?: string;
  @IsOptional() @IsNumber() @Min(0) contractValue?: number;
  @IsOptional() @IsDateString() eventDate?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
}
