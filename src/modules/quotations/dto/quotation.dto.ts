import { Type } from 'class-transformer';
import {
  IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested,
} from 'class-validator';
import { StatusQuotation } from '@prisma/client';

export class QuotationItemDto {
  @IsString() item: string;
  @IsOptional() @IsString() description?: string;
  @IsNumber() @Min(0) unitPrice: number;
  @IsInt() @Min(1) quantity: number;
  @IsOptional() @IsInt() @Min(1) frequency?: number;
  @IsOptional() @IsString() period?: string;
}

export class CreateQuotationDto {
  @IsUUID() projectId: string;
  @IsString() quotationNumber: string;
  @IsOptional() @IsNumber() @Min(0) discountPercent?: number;
  @IsOptional() @IsNumber() @Min(0) taxAmount?: number;
  @IsOptional() @IsString() notes?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => QuotationItemDto)
  items: QuotationItemDto[];
}

export class UpdateQuotationStatusDto {
  @IsEnum(StatusQuotation) status: StatusQuotation;
}
