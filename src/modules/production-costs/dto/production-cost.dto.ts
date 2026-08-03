import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateProductionCostDto {
  @IsUUID() projectId: string;
  @IsString() category: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() executorName?: string;
  @IsNumber() @Min(0) unitPrice: number;
  @IsOptional() @IsInt() @Min(1) quantity?: number;
  @IsOptional() @IsInt() @Min(1) frequency?: number;
  @IsOptional() @IsString() period?: string;
}

export class UpdateProductionCostDto {
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() executorName?: string;
  @IsOptional() @IsNumber() @Min(0) unitPrice?: number;
  @IsOptional() @IsInt() @Min(1) quantity?: number;
  @IsOptional() @IsInt() @Min(1) frequency?: number;
  @IsOptional() @IsString() period?: string;
}

export class RejectCostDto {
  @IsString() rejectionNote: string;
}
