import { IsEnum, IsOptional, IsString } from 'class-validator';
import { KategoriProyek, StatusProyek } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/pagination/pagination.dto';

export class QueryProjectDto extends PaginationQueryDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(KategoriProyek) category?: KategoriProyek;
  @IsOptional() @IsEnum(StatusProyek) status?: StatusProyek;
}
