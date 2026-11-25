import { Type } from 'class-transformer';
import {
  IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested,
} from 'class-validator';

export class InvoiceItemDto {
  @IsString() item: string;
  @IsOptional() @IsString() description?: string;
  @IsNumber() @Min(0) unitPrice: number;
  @IsInt() @Min(1) quantity: number;
  @IsOptional() @IsInt() @Min(1) frequency?: number;
  @IsOptional() @IsString() period?: string;
}

export class CreateInvoiceDto {
  @IsUUID() projectId: string;
  @IsOptional() @IsUUID() quotationId?: string;
  @IsString() invoiceNumber: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsString() paymentInstruction?: string;
  @IsOptional() @IsString() notes?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}

export class UpdateInvoiceDto {
  @IsOptional() @IsString() invoiceNumber?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsString() paymentInstruction?: string;
  @IsOptional() @IsString() notes?: string;
  // Jika items dikirim, seluruh item diganti (full replace) & amount dihitung ulang.
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => InvoiceItemDto)
  items?: InvoiceItemDto[];
}
