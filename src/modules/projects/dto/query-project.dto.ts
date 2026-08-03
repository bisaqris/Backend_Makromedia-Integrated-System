import { IsEnum, IsOptional, IsString } from 'class-validator';
import { KategoriProyek, StatusProyek } from '@prisma/client';

export class QueryProjectDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(KategoriProyek) category?: KategoriProyek;
  @IsOptional() @IsEnum(StatusProyek) status?: StatusProyek;
}
