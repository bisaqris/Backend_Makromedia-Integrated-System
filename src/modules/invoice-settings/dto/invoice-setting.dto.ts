import { Type } from 'class-transformer';
import {
  IsArray, IsNumber, IsOptional, IsString, IsUUID, Max, Min, ValidateNested,
} from 'class-validator';

export class InvoiceBankAccountDto {
  @IsOptional() @IsString() id?: string;
  @IsString() bankName: string;
  @IsString() accountHolder: string;
  @IsString() accountNumber: string;
}

export class UpdateInvoiceSettingDto {
  @IsOptional() @IsNumber() @Min(0) @Max(100) pphPercent?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) termsOfCondition?: string[];
  @IsOptional() @IsString() paymentInstruction?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => InvoiceBankAccountDto)
  bankAccounts?: InvoiceBankAccountDto[];
  @IsOptional() @IsString() signerName?: string;
  @IsOptional() @IsString() signerPosition?: string;
  @IsOptional() @IsString() signerSignatureUrl?: string; // data URL base64 tanda tangan
  @IsOptional() @IsUUID() signerUserId?: string;
}
