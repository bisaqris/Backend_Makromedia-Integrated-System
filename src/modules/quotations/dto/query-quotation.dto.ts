import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { StatusQuotation } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/pagination/pagination.dto';

export class QueryQuotationDto extends PaginationQueryDto {
  @IsOptional() @IsEnum(StatusQuotation) status?: StatusQuotation;
  @IsOptional() @IsUUID() projectId?: string;
  @IsOptional() @IsString() search?: string; // cari berdasarkan quotationNumber
}
