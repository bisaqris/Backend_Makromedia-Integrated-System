import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { StatusInvoice } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/pagination/pagination.dto';

export class QueryInvoiceDto extends PaginationQueryDto {
  @IsOptional() @IsEnum(StatusInvoice) status?: StatusInvoice;
  @IsOptional() @IsUUID() projectId?: string;
  @IsOptional() @IsString() search?: string; // cari berdasarkan invoiceNumber
}
