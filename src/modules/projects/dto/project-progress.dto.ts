import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateProjectProgressDto {
  @IsNumber() @Min(0) @Max(100) percentage: number;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateProjectProgressDto {
  @IsOptional() @IsNumber() @Min(0) @Max(100) percentage?: number;
  @IsOptional() @IsString() notes?: string;
}
