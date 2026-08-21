import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber() @Min(0) amount: number;
  @IsOptional() @IsString() paymentMethod?: string;
  @IsOptional() @IsString() bankTo?: string;
  @IsOptional() @IsString() bankAccount?: string;
  @IsOptional() @IsString() note?: string;
  @IsOptional() @IsDateString() paidAt?: string;
}
