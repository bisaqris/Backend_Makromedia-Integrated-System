import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { StatusTask } from '@prisma/client';

export class CreateTaskDto {
  @IsString() title: string;
  @IsOptional() @IsUUID() assignedToId?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsEnum(StatusTask) status?: StatusTask;
  @IsOptional() @IsInt() @Min(0) @Max(100) progress?: number;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateTaskDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsUUID() assignedToId?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsEnum(StatusTask) status?: StatusTask;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateTaskProgressDto {
  @IsInt() @Min(0) @Max(100) progress: number;
}
